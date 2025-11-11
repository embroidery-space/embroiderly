use std::path::PathBuf;

use embroiderly_image::ImageImportOptions;
use tauri_plugin_shell::ShellExt as _;

use crate::error::{PatternError, Result};

/// A utility for importing images into cross-stitch patterns using the `embroiderly_image` sidecar.
pub struct ImageImportSidecar<R: tauri::Runtime> {
  app_handle: tauri::AppHandle<R>,
  image_path: Option<PathBuf>,
  palette_path: Option<PathBuf>,
  options: Option<ImageImportOptions>,
}

impl<R: tauri::Runtime> ImageImportSidecar<R> {
  /// Create a new sidecar instance with the given app handle.
  pub const fn new(app_handle: tauri::AppHandle<R>) -> Self {
    Self {
      app_handle,
      image_path: None,
      palette_path: None,
      options: None,
    }
  }

  /// Set the image file path to import.
  pub fn image_path<P: Into<PathBuf>>(mut self, path: P) -> Self {
    self.image_path = Some(path.into());
    self
  }

  /// Set the palette file path to use for color conversion.
  pub fn palette_path<P: Into<PathBuf>>(mut self, path: P) -> Self {
    self.palette_path = Some(path.into());
    self
  }

  /// Set the image import options.
  pub const fn options(mut self, options: ImageImportOptions) -> Self {
    self.options = Some(options);
    self
  }
}

impl<R: tauri::Runtime> super::SidecarRunner for ImageImportSidecar<R> {
  async fn run_async(self) -> Result<super::Output> {
    let image_path = self
      .image_path
      .ok_or_else(|| PatternError::FailedToExport(anyhow::anyhow!("Image path is required")))?;
    let palette_path = self
      .palette_path
      .ok_or_else(|| PatternError::FailedToExport(anyhow::anyhow!("Palette path is required")))?;
    let options = self
      .options
      .ok_or_else(|| PatternError::FailedToExport(anyhow::anyhow!("Image import options are required")))
      .and_then(|options| {
        serde_json::to_string(&options)
          .map_err(|e| PatternError::FailedToExport(anyhow::anyhow!("Failed to serialize image import options: {e}")))
      })?;

    let mut sidecar = self
      .app_handle
      .shell()
      .sidecar("embroiderly_image")
      .map_err(|e| PatternError::FailedToExport(e.into()))?;

    // Set logs directory.
    sidecar = sidecar.env(
      embroiderly_logger::EMBROIDERLY_LOG_DIR_ENV_VAR,
      crate::utils::path::app_logs_dir(&self.app_handle)?,
    );

    // Set required arguments.
    sidecar = sidecar
      .arg("--image")
      .arg(&image_path)
      .arg("--palette")
      .arg(&palette_path)
      .arg("--options")
      .arg(&options);

    // Execute the command.
    let output = super::collect_sidecar_binary_output(sidecar).await?;

    super::handle_sidecar_output(&self.app_handle, output, "embroiderly_image")
  }
}
