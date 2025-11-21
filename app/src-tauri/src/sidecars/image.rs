use tauri::async_runtime::Receiver;
use tauri_plugin_shell::ShellExt as _;
use tauri_plugin_shell::process::{CommandChild, CommandEvent};

use crate::error::{PatternError, Result};

/// Manager for the long-lived image import sidecar process.
pub struct ImageImportSidecar<R: tauri::Runtime> {
  app_handle: tauri::AppHandle<R>,
  sidecar_handle: Option<(Receiver<CommandEvent>, CommandChild)>,
}

impl<R: tauri::Runtime> ImageImportSidecar<R> {
  /// Create a new sidecar controller with the given app handle.
  pub const fn new(app_handle: tauri::AppHandle<R>) -> Self {
    Self { app_handle, sidecar_handle: None }
  }
}

#[async_trait::async_trait]
impl<R: tauri::Runtime> super::SidecarController for ImageImportSidecar<R> {
  async fn spawn(&mut self) -> Result<super::SidecarId> {
    let mut sidecar = self
      .app_handle
      .shell()
      .sidecar("embroiderly_image")
      .map_err(|e| PatternError::FailedToExport(e.into()))?;

    // Important: set raw output handling.
    sidecar = sidecar.set_raw_out(true);

    // Set logs directory.
    sidecar = sidecar.env(
      embroiderly_logger::EMBROIDERLY_LOG_DIR_ENV_VAR,
      crate::utils::path::app_logs_dir(&self.app_handle)?,
    );

    // Add the "import" subcommand.
    sidecar = sidecar.arg("import");

    // Spawn the sidecar process.
    let (rx, child) = sidecar
      .spawn()
      .map_err(|e| PatternError::FailedToExport(anyhow::anyhow!("Failed to spawn sidecar: {e}")))?;
    let id = child.pid();

    // Store the sidecar handle.
    self.sidecar_handle = Some((rx, child));

    Ok(id)
  }

  async fn shutdown(&mut self) -> Result<super::Output> {
    let Some((rx, child)) = self.sidecar_handle.take() else {
      return Err(PatternError::FailedToExport(anyhow::anyhow!("Sidecar handle not set")).into());
    };

    child
      .kill()
      .map_err(|_| PatternError::FailedToExport(anyhow::anyhow!("Failed to shutdown sidecar process")))?;

    super::utils::collect_sidecar_binary_output_from_receiver(rx).await
  }

  async fn send_message(&mut self, message: Vec<u8>) -> Result<()> {
    if let Some(sidecar_handle) = self.sidecar_handle.as_mut() {
      let child = &mut sidecar_handle.1;
      child
        .write(&super::utils::with_newline(message))
        .map_err(|e| PatternError::FailedToExport(anyhow::anyhow!("Failed to write message to stdin: {e}")).into())
    } else {
      Err(PatternError::FailedToExport(anyhow::anyhow!("Sidecar handle not set")).into())
    }
  }

  // This sidecar uses length-prefixed raw binary buffers.
  async fn get_response(&mut self) -> Result<Vec<u8>> {
    let mut buffer = Vec::new();
    let mut expected_length: Option<u64> = None;

    let Some(sidecar_handle) = self.sidecar_handle.as_mut() else {
      return Err(PatternError::FailedToExport(anyhow::anyhow!("Sidecar handle not set")).into());
    };
    let rx = &mut sidecar_handle.0;

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
            PatternError::FailedToExport(anyhow::anyhow!("Sidecar terminated before sending complete response")).into(),
          );
        }
        CommandEvent::Error(error) => {
          return Err(PatternError::FailedToExport(anyhow::anyhow!("Sidecar error: {error}")).into());
        }
        _ => {}
      }
    }

    Err(PatternError::FailedToExport(anyhow::anyhow!("Failed to receive complete response from sidecar")).into())
  }
}
