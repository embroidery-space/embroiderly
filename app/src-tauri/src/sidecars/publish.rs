use std::path::PathBuf;

use embroiderly_pattern::PdfExportOptions;
use tauri::Manager as _;
use tauri_plugin_shell::ShellExt as _;

use crate::error::{PatternError, Result};

/// A utility for exporting cross-stitch patterns as a PDF documents using the `embroiderly_publish` sidecar.
pub struct PdfExportSidecar<R: tauri::Runtime> {
  app_handle: tauri::AppHandle<R>,
  pattern_path: Option<PathBuf>,
  output_path: Option<PathBuf>,
  options: Option<PdfExportOptions>,
}

impl<R: tauri::Runtime> PdfExportSidecar<R> {
  /// Create a new sidecar instance with the given app handle.
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

impl<R: tauri::Runtime> super::SidecarRunner for PdfExportSidecar<R> {
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

    super::handle_sidecar_output(&self.app_handle, output, "embroiderly_publish")
  }
}
