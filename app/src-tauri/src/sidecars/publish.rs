use std::path::PathBuf;

use embroiderly_pattern::PdfExportOptions;
use tauri::Manager as _;
use tauri_plugin_shell::ShellExt as _;

use super::SidecarRunner;
use crate::error::{PatternError, Result};
use crate::vendor::telemetry::sentry;

/// A utility struct for exporting the pattern as a PDF document using the `embroiderly_publish` sidecar.
pub struct ExportPdfSidecar<R: tauri::Runtime> {
  app_handle: tauri::AppHandle<R>,
  pattern_path: Option<PathBuf>,
  output_path: Option<PathBuf>,
  options: Option<PdfExportOptions>,
}

impl<R: tauri::Runtime> ExportPdfSidecar<R> {
  /// Create a new `PublishSidecar` instance with the given app handle.
  pub fn new(app_handle: tauri::AppHandle<R>) -> Self {
    Self {
      app_handle,
      pattern_path: None,
      output_path: None,
      options: None,
    }
  }

  /// Set the pattern file path to export.
  pub fn pattern_path<P: Into<PathBuf>>(mut self, path: P) -> Self {
    self.pattern_path = Some(path.into());
    self
  }

  /// Set the output file path for the exported pattern.
  pub fn output_path<P: Into<PathBuf>>(mut self, path: P) -> Self {
    self.output_path = Some(path.into());
    self
  }

  /// Set the PDF export options.
  pub fn options(mut self, options: PdfExportOptions) -> Self {
    self.options = Some(options);
    self
  }
}

impl<R: tauri::Runtime> SidecarRunner for ExportPdfSidecar<R> {
  async fn run_async(self) -> Result<tauri_plugin_shell::process::Output> {
    let pattern_path = self
      .pattern_path
      .ok_or_else(|| PatternError::FailedToExport(anyhow::anyhow!("Pattern path is required")))?;
    let output_path = self
      .output_path
      .ok_or_else(|| PatternError::FailedToExport(anyhow::anyhow!("Output path is required")))?;
    let options = self
      .options
      .ok_or_else(|| PatternError::FailedToExport(anyhow::anyhow!("PDF export options are required")))
      .and_then(|options| {
        serde_json::to_string(&options)
          .map_err(|e| PatternError::FailedToExport(anyhow::anyhow!("Failed to serialize PDF export options: {e}")))
      })?;

    let system_fonts_dir = self
      .app_handle
      .path()
      .resolve("resources/fonts", tauri::path::BaseDirectory::Resource)?;
    let custom_fonts_dir = crate::utils::path::app_data_dir(&self.app_handle)?.join("fonts");

    let mut sidecar = self
      .app_handle
      .shell()
      .sidecar("embroiderly_publish")
      .map_err(|e| PatternError::FailedToExport(e.into()))?;

    // Set logs directory.
    sidecar = sidecar.env(
      embroiderly_logger::EMBROIDERLY_LOG_DIR_ENV_VAR,
      crate::utils::path::app_logs_dir(&self.app_handle)?,
    );

    // Set required arguments.
    sidecar = sidecar
      .arg("--pattern")
      .arg(&pattern_path)
      .arg("--output")
      .arg(&output_path)
      .arg("--options")
      .arg(&options)
      .arg("--symbol-fonts-dir")
      .arg(&system_fonts_dir)
      .arg("--symbol-fonts-dir")
      .arg(&custom_fonts_dir);

    // Execute the command.
    let output = sidecar
      .output()
      .await
      .map_err(|e| PatternError::FailedToExport(e.into()))?;

    // Handle sidecar failure and capture to Sentry if enabled.
    if !output.status.success() {
      let stdout = String::from_utf8_lossy(&output.stdout);
      let stderr = String::from_utf8_lossy(&output.stderr);
      let exit_code = output.status.code();

      log::error!("Sidecar 'embroiderly_publish' failed with exit code {exit_code:?}: {stderr}",);

      // Capture error to Sentry with sidecar log file attachment.
      if crate::utils::settings::telemetry_diagnostics_enabled(&self.app_handle) {
        let log_file_path = crate::utils::path::app_logs_dir(&self.app_handle)?.join("embroiderly_publish.log");

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
              filename: String::from("embroiderly_publish.log"),
              content_type: Some(String::from("text/plain")),
              ty: None,
            });
          }
        });

        sentry::capture_message(
          &format!("Sidecar 'embroiderly_publish' failed with exit code {exit_code:?}",),
          sentry::Level::Error,
        );
      }

      return Err(
        PatternError::FailedToExport(anyhow::anyhow!(
          "Sidecar process terminated with exit code {exit_code:?}: {stderr}",
        ))
        .into(),
      );
    }

    Ok(output)
  }
}
