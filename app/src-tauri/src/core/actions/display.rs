use std::sync::OnceLock;

use anyhow::Result;
use embroiderly_pattern::{DisplaySettings, PatternProject};
use tauri::{Emitter as _, WebviewWindow};

use super::Action;
use crate::utils::base64;

#[cfg(test)]
#[path = "display.test.rs"]
mod tests;

#[derive(Clone)]
pub struct UpdateDisplaySettingsAction {
  display_settings: DisplaySettings,
  old_display_settings: OnceLock<DisplaySettings>,
}

impl UpdateDisplaySettingsAction {
  pub const fn new(display_settings: DisplaySettings) -> Self {
    Self {
      display_settings,
      old_display_settings: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for UpdateDisplaySettingsAction {
  /// Updates the display settings.
  ///
  /// **Emits:**
  /// - `display:update` with the updated display settings.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_display_settings = std::mem::replace(&mut patproj.display_settings, self.display_settings.clone());
    window.emit("display:update", base64::encode(borsh::to_vec(&self.display_settings)?))?;
    if self.old_display_settings.get().is_none() {
      self.old_display_settings.set(old_display_settings).unwrap();
    }
    Ok(())
  }

  /// Restores the previous display settings.
  ///
  /// **Emits:**
  /// - `display:update` with the previous display settings.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_display_settings = self.old_display_settings.get().unwrap();
    patproj.display_settings = old_display_settings.clone();
    window.emit("display:update", base64::encode(borsh::to_vec(old_display_settings)?))?;
    Ok(())
  }
}
