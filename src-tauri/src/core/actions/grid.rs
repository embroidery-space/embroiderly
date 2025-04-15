use std::sync::OnceLock;

use anyhow::Result;
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::core::pattern::{Grid, PatternProject};
use crate::utils::base64;

#[cfg(test)]
#[path = "grid.test.rs"]
mod tests;

#[derive(Clone)]
pub struct UpdateGridPropertiesAction {
  grid: Grid,
  old_grid: OnceLock<Grid>,
}

impl UpdateGridPropertiesAction {
  pub fn new(grid: Grid) -> Self {
    Self { grid, old_grid: OnceLock::new() }
  }
}

impl<R: tauri::Runtime> Action<R> for UpdateGridPropertiesAction {
  /// Updates the grid properties.
  ///
  /// **Emits:**
  /// - `grid:update` with the updated grid properties.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    window.emit("grid:update", base64::encode(borsh::to_vec(&self.grid)?))?;
    let old_grid = std::mem::replace(&mut patproj.display_settings.grid, self.grid.clone());
    if self.old_grid.get().is_none() {
      self.old_grid.set(old_grid).unwrap();
    }
    Ok(())
  }

  /// Restore the the previous grid properties.
  ///
  /// **Emits:**
  /// - `grid:update` with the previous grid properties.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_grid = self.old_grid.get().unwrap();
    window.emit("grid:update", base64::encode(borsh::to_vec(&old_grid)?))?;
    patproj.display_settings.grid = old_grid.clone();
    Ok(())
  }
}
