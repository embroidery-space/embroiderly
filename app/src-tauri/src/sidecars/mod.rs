use crate::vendor::telemetry::sentry;

mod image;
pub use image::*;

mod publish;
pub use publish::*;

/// Trait for executing sidecar commands.
pub trait SidecarRunner {
  /// Execute the sidecar command asynchronously and return the output.
  async fn run_async(self) -> crate::error::Result<tauri_plugin_shell::process::Output>;

  /// Execute the sidecar command synchronously and return the output.
  fn run(self) -> crate::error::Result<tauri_plugin_shell::process::Output>
  where
    Self: Sized,
  {
    tauri::async_runtime::block_on(self.run_async())
  }
}

/// Handle sidecar output and capture failure to Sentry if enabled.
pub fn handle_sidecar_output<R: tauri::Runtime>(
  app_handle: &tauri::AppHandle<R>,
  output: tauri_plugin_shell::process::Output,
  sidecar_name: &str,
) -> crate::error::Result<tauri_plugin_shell::process::Output> {
  // Handle sidecar failure and capture to Sentry if enabled.
  if !output.status.success() {
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    let exit_code = output.status.code();

    log::error!("Sidecar '{sidecar_name}' failed with exit code {exit_code:?}: {stderr}");

    // Capture error to Sentry with sidecar log file attachment.
    if crate::utils::settings::telemetry_diagnostics_enabled(app_handle) {
      let log_file_name = format!("{sidecar_name}.log");
      let log_file_path = crate::utils::path::app_logs_dir(app_handle)?.join(&log_file_name);

      sentry::configure_scope(|scope| {
        // Add sidecar output as extra data.
        scope.set_extra("sidecar_stdout", stdout.to_string().into());
        scope.set_extra("sidecar_stderr", stderr.to_string().into());
        scope.set_extra("sidecar_exit_code", exit_code.into());

        // Attach sidecar log file if it exists.
        if log_file_path.exists()
          && let Ok(log_contents) = std::fs::read(&log_file_path)
        {
          scope.add_attachment(sentry::protocol::Attachment {
            buffer: log_contents,
            filename: log_file_name,
            content_type: Some(String::from("text/plain")),
            ty: None,
          });
        }
      });

      sentry::capture_message(
        &format!("Sidecar '{sidecar_name}' failed with exit code {exit_code:?}"),
        sentry::Level::Error,
      );
    }

    return Err(anyhow::anyhow!("Sidecar process terminated with exit code {exit_code:?}: {stderr}").into());
  }

  Ok(output)
}
