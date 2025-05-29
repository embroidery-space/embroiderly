use std::sync::OnceLock;

use anyhow::Result;
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::core::pattern::{PatternInfo, PatternProject};
use crate::utils::base64;

#[cfg(test)]
#[path = "pattern.test.rs"]
mod tests;

#[derive(Clone)]
pub struct UpdatePatternInfoAction {
  info: PatternInfo,
  old_info: OnceLock<PatternInfo>,
}

impl UpdatePatternInfoAction {
  pub fn new(info: PatternInfo) -> Self {
    Self { info, old_info: OnceLock::new() }
  }
}

impl<R: tauri::Runtime> Action<R> for UpdatePatternInfoAction {
  /// Updates the pattern information.
  ///
  /// **Emits:**
  /// - `pattern-info:update` with the updated pattern information.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    window.emit("pattern-info:update", base64::encode(borsh::to_vec(&self.info)?))?;
    let old_info = std::mem::replace(&mut patproj.pattern.info, self.info.clone());
    if self.old_info.get().is_none() {
      self.old_info.set(old_info).unwrap();
    }
    Ok(())
  }

  /// Restore the the previous pattern information.
  ///
  /// **Emits:**
  /// - `pattern-info:update` with the previous pattern information.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_info = self.old_info.get().unwrap();
    window.emit("pattern-info:update", base64::encode(borsh::to_vec(&old_info)?))?;
    patproj.pattern.info = old_info.clone();
    Ok(())
  }
}
