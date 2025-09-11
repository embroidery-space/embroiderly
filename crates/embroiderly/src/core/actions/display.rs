use std::sync::OnceLock;

use anyhow::Result;
use embroiderly_pattern::{DisplayMode, LayersVisibility, PatternProject};
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::utils::base64;

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
    let old_mode = std::mem::replace(&mut patproj.display_settings.display_mode, self.mode);
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
    patproj.display_settings.display_mode = *old_mode;
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

#[derive(Clone)]
pub struct SetLayersVisibilityAction {
  layers_visibility: LayersVisibility,
  old_layers_visibility: OnceLock<LayersVisibility>,
}

impl SetLayersVisibilityAction {
  pub fn new(layers_visibility: LayersVisibility) -> Self {
    Self {
      layers_visibility,
      old_layers_visibility: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for SetLayersVisibilityAction {
  /// Updates the layers visibility.
  ///
  /// **Emits:**
  /// - `display:set_layers_visibility` with the updated layers visibility.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    window.emit(
      "display:set_layers_visibility",
      base64::encode(borsh::to_vec(&self.layers_visibility)?),
    )?;
    let old_layers_visibility =
      std::mem::replace(&mut patproj.display_settings.layers_visibility, self.layers_visibility);
    if self.old_layers_visibility.get().is_none() {
      self.old_layers_visibility.set(old_layers_visibility).unwrap();
    }
    Ok(())
  }

  /// Restores the previous layers visibility.
  ///
  /// **Emits:**
  /// - `display:set_layers_visibility` with the previous layers visibility.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_layers_visibility = self.old_layers_visibility.get().unwrap();
    window.emit(
      "display:set_layers_visibility",
      base64::encode(borsh::to_vec(old_layers_visibility)?),
    )?;
    patproj.display_settings.layers_visibility = *old_layers_visibility;
    Ok(())
  }
}
