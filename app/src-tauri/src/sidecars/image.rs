use std::path::PathBuf;

use embroiderly_image::ImageImportOptions;
use tauri::async_runtime::Receiver;
use tauri_plugin_shell::ShellExt as _;
use tauri_plugin_shell::process::{CommandChild, CommandEvent};

use crate::error::{PatternError, Result};

/// Manager for the long-lived image import sidecar process.
pub struct ImageImportSidecar<R: tauri::Runtime> {
  app_handle: tauri::AppHandle<R>,
  child: CommandChild,
  rx: Receiver<CommandEvent>,
}

impl<R: tauri::Runtime> ImageImportSidecar<R> {
  /// Create a new sidecar manager with the given app handle.
  pub async fn new(app_handle: tauri::AppHandle<R>, image_path: PathBuf) -> Result<Self> {
    let mut sidecar = app_handle
      .shell()
      .sidecar("embroiderly_image")
      .map_err(|e| PatternError::FailedToExport(e.into()))?;

    // Set logs directory.
    sidecar = sidecar.env(
      embroiderly_logger::EMBROIDERLY_LOG_DIR_ENV_VAR,
      crate::utils::path::app_logs_dir(&app_handle)?,
    );

    // Add the "import" subcommand.
    sidecar = sidecar.arg("import").arg("--image").arg(image_path).set_raw_out(true);

    // Spawn the sidecar process.
    let (rx, child) = sidecar
      .spawn()
      .map_err(|e| PatternError::FailedToExport(anyhow::anyhow!("Failed to spawn sidecar: {e}")))?;

    Ok(Self { app_handle, child, rx })
  }

  /// Send an updated message and receive the new pattern result.
  pub async fn get_pattern(
    &mut self,
    image_path: PathBuf,
    palette_path: PathBuf,
    options: ImageImportOptions,
  ) -> Result<Vec<u8>> {
    // Compose the update message.
    let update = {
      let mut value = serde_json::json!({
        "imagePath": image_path,
        "palettePath": palette_path,
        "options": options
      })
      .to_string();
      value.push('\n');
      value
    };

    // Send the update message.
    self
      .child
      .write(update.as_bytes())
      .map_err(|e| PatternError::FailedToExport(anyhow::anyhow!("Failed to write command to stdin: {e}")))?;

    self.receive_response().await
  }

  /// Receive a length-prefixed binary response from the sidecar via stdout.
  async fn receive_response(&mut self) -> Result<Vec<u8>> {
    let mut buffer = Vec::new();
    let mut expected_length: Option<u64> = None;

    while let Some(event) = self.rx.recv().await {
      match event {
        CommandEvent::Stdout(chunk) => {
          buffer.extend(chunk);

          // Try to read the length prefix if we haven't yet.
          if expected_length.is_none() && buffer.len() >= 8 {
            let length_bytes: [u8; 8] = buffer[0..8]
              .try_into()
              .map_err(|_| PatternError::FailedToExport(anyhow::anyhow!("Failed to read length prefix")))?;
            expected_length = Some(u64::from_le_bytes(length_bytes));
          }

          // Check if we have received the complete payload.
          if let Some(length) = expected_length {
            let total_expected = 8 + length as usize;
            if buffer.len() >= total_expected {
              // Extract the payload (skip the 8-byte length prefix).
              return Ok(buffer[8..total_expected].to_vec());
            }
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

  /// Shutdown the sidecar process.
  pub async fn shutdown(self) -> Result<super::Output> {
    self
      .child
      .kill()
      .map_err(|_| PatternError::FailedToExport(anyhow::anyhow!("Failed to shutdown sidecar process")))?;

    let output = super::collect_sidecar_binary_output_from_receiver(self.rx).await?;
    super::handle_sidecar_output(&self.app_handle, output, "embroiderly_image")
  }
}
