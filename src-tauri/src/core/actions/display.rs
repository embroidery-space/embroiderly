use std::sync::OnceLock;

use anyhow::Result;
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::core::pattern::{DisplayMode, PatternProject};

#[cfg(test)]
#[path = "display.test.rs"]
mod tests;

#[derive(Clone)]
pub struct SetDisplayModeAction {
  mode: DisplayMode,
  old_mode: OnceLock<DisplayMode>,
}

impl SetDisplayModeAction {
  pub fn new(mode: DisplayMode) -> Self {
    Self { mode, old_mode: OnceLock::new() }
  }
}

impl<R: tauri::Runtime> Action<R> for SetDisplayModeAction {
  /// Updates the display mode.
  ///
  /// **Emits:**
  /// - `display:set_mode` with the updated display mode.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    window.emit("display:set_mode", self.mode.to_string())?;
    let old_mode = std::mem::replace(&mut patproj.display_settings.display_mode, self.mode.clone());
    if self.old_mode.get().is_none() {
      self.old_mode.set(old_mode).unwrap();
    }
    Ok(())
  }

  /// Restores the previous display mode.
  ///
  /// **Emits:**
  /// - `display:set_mode` with the previous display mode.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_mode = self.old_mode.get().unwrap();
    window.emit("display:set_mode", old_mode.to_string())?;
    patproj.display_settings.display_mode = old_mode.clone();
    Ok(())
  }
}

#[derive(Clone)]
pub struct ShowSymbolsAction {
  value: bool,
}

impl ShowSymbolsAction {
  pub fn new(value: bool) -> Self {
    Self { value }
  }
}

impl<R: tauri::Runtime> Action<R> for ShowSymbolsAction {
  /// Updates the display setting for showing symbols.
  ///
  /// **Emits:**
  /// - `display:show_symbols` with the new value.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    patproj.display_settings.show_symbols = self.value;
    window.emit("display:show_symbols", self.value)?;
    Ok(())
  }

  /// Toggles the display setting for showing symbols.
  ///
  /// **Emits:**
  /// - `display:show_symbols` with the new value.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    patproj.display_settings.show_symbols = !self.value;
    window.emit("display:show_symbols", !self.value)?;
    Ok(())
  }
}
