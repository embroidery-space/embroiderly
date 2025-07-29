use std::sync::OnceLock;

use anyhow::Result;
use embroiderly_pattern::{PatternProject, ReferenceImage};
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::utils::base64;

#[cfg(test)]
#[path = "image.test.rs"]
mod tests;

#[derive(Clone)]
pub struct SetReferenceImageAction {
  image: ReferenceImage,
  old_image: OnceLock<Option<ReferenceImage>>,
}

impl SetReferenceImageAction {
  pub fn new(image: ReferenceImage) -> Self {
    Self {
      image,
      old_image: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for SetReferenceImageAction {
  /// Sets a reference image.
  ///
  /// **Emits:**
  /// - `image:set` with the new reference image.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    window.emit("image:set", base64::encode(borsh::to_vec(&self.image)?))?;
    let old_image = patproj.reference_image.replace(self.image.clone());
    if self.old_image.get().is_none() {
      self.old_image.set(old_image).unwrap();
    }
    Ok(())
  }

  /// Restore the the previous image.
  ///
  /// **Emits:**
  /// - `image:set` with the previous reference image if it exists.
  /// - `image:remove` if there was no previous image.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_image = self.old_image.get().unwrap();
    if let Some(old_image) = old_image {
      window.emit("image:set", base64::encode(borsh::to_vec(old_image)?))?;
    } else {
      window.emit("image:remove", ())?;
    }
    patproj.reference_image = old_image.clone();
    Ok(())
  }
}
