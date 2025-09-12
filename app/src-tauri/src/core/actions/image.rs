use std::sync::OnceLock;

use anyhow::Result;
use embroiderly_pattern::{PatternProject, ReferenceImage, ReferenceImageSettings};
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::utils::base64;

#[cfg(test)]
#[path = "image.test.rs"]
mod tests;

#[derive(Clone)]
pub struct SetReferenceImageAction {
  image: Option<ReferenceImage>,
  old_image: OnceLock<Option<ReferenceImage>>,
}

impl SetReferenceImageAction {
  pub fn new(image: Option<ReferenceImage>) -> Self {
    Self {
      image,
      old_image: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for SetReferenceImageAction {
  /// Sets or removes a reference image.
  ///
  /// **Emits:**
  /// - `image:set` with the new reference image wrapped in Option (None for removal).
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    window.emit("image:set", base64::encode(borsh::to_vec(&self.image)?))?;
    let old_image = std::mem::replace(&mut patproj.reference_image, self.image.clone());
    if self.old_image.get().is_none() {
      self.old_image.set(old_image).unwrap();
    }
    Ok(())
  }

  /// Restore the the previous image.
  ///
  /// **Emits:**
  /// - `image:set` with the previous reference image wrapped in Option (None if no previous image).
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_image = self.old_image.get().unwrap();
    window.emit("image:set", base64::encode(borsh::to_vec(&old_image)?))?;
    patproj.reference_image = old_image.clone();
    Ok(())
  }
}

#[derive(Clone)]
pub struct UpdateReferenceImageSettingsAction {
  settings: ReferenceImageSettings,
  old_settings: OnceLock<ReferenceImageSettings>,
}

impl UpdateReferenceImageSettingsAction {
  pub fn new(settings: ReferenceImageSettings) -> Self {
    Self {
      settings,
      old_settings: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for UpdateReferenceImageSettingsAction {
  /// Updates the reference image settings.
  ///
  /// **Emits:**
  /// - `image:settings:update` with the new settings.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    debug_assert!(patproj.reference_image.is_some());
    window.emit("image:settings:update", base64::encode(borsh::to_vec(&self.settings)?))?;
    let old_settings = std::mem::replace(&mut patproj.reference_image.as_mut().unwrap().settings, self.settings);
    if self.old_settings.get().is_none() {
      self.old_settings.set(old_settings).unwrap();
    }
    Ok(())
  }

  /// Restore the previous settings.
  ///
  /// **Emits:**
  /// - `image:settings:update` with the previous settings if it exists.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_settings = self.old_settings.get().unwrap();
    if let Some(image) = patproj.reference_image.as_mut() {
      image.settings = *old_settings;
      window.emit("image:settings:update", base64::encode(borsh::to_vec(&old_settings)?))?;
    }
    Ok(())
  }
}
