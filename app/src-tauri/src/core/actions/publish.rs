use std::sync::OnceLock;

use anyhow::Result;
use embroiderly_pattern::{PatternProject, PdfExportOptions};
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::utils::base64;

#[cfg(test)]
#[path = "publish.test.rs"]
mod tests;

#[derive(Clone)]
pub struct UpdatePdfExportOptionsAction {
  options: PdfExportOptions,
  old_options: OnceLock<PdfExportOptions>,
}

impl UpdatePdfExportOptionsAction {
  pub fn new(options: PdfExportOptions) -> Self {
    Self {
      options,
      old_options: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for UpdatePdfExportOptionsAction {
  /// Updates the PDF export options.
  ///
  /// **Emits:**
  /// - `publish:update-pdf:` with the updated PDF export options.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_options = std::mem::replace(&mut patproj.publish_settings.pdf, self.options);
    window.emit("publish:update-pdf", base64::encode(borsh::to_vec(&self.options)?))?;

    if self.old_options.get().is_none() {
      self.old_options.set(old_options).unwrap();
    }

    Ok(())
  }

  /// Restore the the previous PDF export options.
  ///
  /// **Emits:**
  /// - `publish:update-pdf` with the previous PDF export options.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_options = self.old_options.get().unwrap();
    patproj.publish_settings.pdf = *old_options;
    window.emit("publish:update-pdf", base64::encode(borsh::to_vec(old_options)?))?;

    Ok(())
  }
}
