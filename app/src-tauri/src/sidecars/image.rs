use tauri::async_runtime::Receiver;
use tauri_plugin_shell::ShellExt as _;
use tauri_plugin_shell::process::{CommandChild, CommandEvent};

use crate::error::{Error, ErrorKind, Result};

/// Manager for the long-lived image import sidecar process.
pub struct ImageImportSidecar<R: tauri::Runtime> {
  app_handle: tauri::AppHandle<R>,
  sidecar_handle: Option<(Receiver<CommandEvent>, CommandChild)>,
}

impl<R: tauri::Runtime> ImageImportSidecar<R> {
  /// Create a new sidecar controller with the given app handle.
  pub const fn new(app_handle: tauri::AppHandle<R>) -> Self {
    Self {
      app_handle,
      sidecar_handle: None,
    }
  }

  fn receiver(&mut self) -> Result<&mut Receiver<CommandEvent>> {
    match self.sidecar_handle.as_mut() {
      Some(sidecar_handle) => Ok(&mut sidecar_handle.0),
      None => Err(Error::new(ErrorKind::FailedToImport).with_source(anyhow::anyhow!("Sidecar handle not set"))),
    }
  }

  fn child(&mut self) -> Result<&mut CommandChild> {
    match self.sidecar_handle.as_mut() {
      Some(sidecar_handle) => Ok(&mut sidecar_handle.1),
      None => Err(Error::new(ErrorKind::FailedToImport).with_source(anyhow::anyhow!("Sidecar handle not set"))),
    }
  }
}

#[async_trait::async_trait]
impl<R: tauri::Runtime> super::SidecarController for ImageImportSidecar<R> {
  async fn spawn(&mut self) -> Result<super::SidecarId> {
    let mut sidecar = self
      .app_handle
      .shell()
      .sidecar("embroiderly_image")
      .map_err(|e| Error::new(ErrorKind::FailedToImport).with_source(e))?;

    // Important: set raw output handling.
    sidecar = sidecar.set_raw_out(true);

    // Set logs directory.
    sidecar = sidecar.env(
      embroiderly_tracing::EMBROIDERLY_LOGS_DIR_ENV_VAR,
      crate::utils::path::app_logs_dir(&self.app_handle)?,
    );

    // Add the "import" subcommand.
    sidecar = sidecar.arg("import");

    // Spawn the sidecar process.
    let (rx, child) = sidecar.spawn().map_err(|e| {
      Error::new(ErrorKind::FailedToImport).with_source(anyhow::anyhow!("Failed to spawn sidecar: {e}"))
    })?;
    let id = child.pid();

    // Store the sidecar handle.
    self.sidecar_handle = Some((rx, child));

    Ok(id)
  }

  async fn shutdown(&mut self) -> Result<super::Output> {
    {
      let command = embroiderly_image::ImageImportServerCommand::Shutdown;
      let payload = serde_json::to_vec(&command).map_err(|e| {
        Error::new(ErrorKind::FailedToImport).with_source(anyhow::anyhow!("Failed to serialize command: {e}"))
      })?;
      self.send_command(payload).await?;
    }

    let Some((rx, _child)) = self.sidecar_handle.take() else {
      return Err(Error::new(ErrorKind::FailedToImport).with_source(anyhow::anyhow!("Sidecar handle not set")));
    };

    let output = super::utils::collect_sidecar_binary_output_from_receiver(rx).await?;
    super::utils::handle_sidecar_output(output, "embroiderly_image")
  }

  async fn send_command(&mut self, payload: Vec<u8>) -> Result<()> {
    self.child()?.write(&super::utils::with_newline(payload)).map_err(|e| {
      Error::new(ErrorKind::FailedToImport).with_source(anyhow::anyhow!("Failed to write message to stdin: {e}"))
    })
  }

  // This sidecar uses length-prefixed raw binary buffers.
  async fn get_response(&mut self) -> Result<Vec<u8>> {
    let mut buffer = Vec::new();
    let mut expected_length: Option<u64> = None;

    let rx = self.receiver()?;
    while let Some(event) = rx.recv().await {
      match event {
        CommandEvent::Stdout(chunk) => {
          // Try to read the length prefix if we haven't yet.
          if expected_length.is_none() {
            let (header, body) = chunk.split_at(8);
            expected_length = Some(u64::from_le_bytes(header.try_into().unwrap()));
            buffer.extend(body);
          } else {
            buffer.extend(chunk);
          }

          // Check if we have received the complete payload.
          if expected_length.is_some_and(|length| buffer.len() >= length as usize) {
            return Ok(buffer);
          }
        }
        CommandEvent::Terminated(_) => {
          return Err(
            Error::new(ErrorKind::FailedToImport)
              .with_source(anyhow::anyhow!("Sidecar terminated before sending complete response")),
          );
        }
        CommandEvent::Error(error) => {
          return Err(Error::new(ErrorKind::FailedToImport).with_source(anyhow::anyhow!("Sidecar error: {error}")));
        }
        _ => {}
      }
    }

    Err(
      Error::new(ErrorKind::FailedToImport)
        .with_source(anyhow::anyhow!("Failed to receive complete response from sidecar")),
    )
  }
}
