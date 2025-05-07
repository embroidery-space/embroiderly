use std::sync::OnceLock;

use anyhow::Result;
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::Stitch;
use crate::core::pattern::{Fabric, PatternProject};
use crate::utils::base64;

#[cfg(test)]
#[path = "fabric.test.rs"]
mod tests;

#[derive(Clone)]
pub struct UpdateFabricPropertiesAction {
  fabric: Fabric,
  old_fabric: OnceLock<Fabric>,
  extra_stitches: OnceLock<Vec<Stitch>>,
}

impl UpdateFabricPropertiesAction {
  pub fn new(fabric: Fabric) -> Self {
    Self {
      fabric,
      old_fabric: OnceLock::new(),
      extra_stitches: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for UpdateFabricPropertiesAction {
  /// Updates the fabric properties.
  ///
  /// **Emits:**
  /// - `fabric:update` with the updated fabric properties.
  /// - `stitches:remove_many` with the stitches that are outside the new fabric bounds.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_fabric = std::mem::replace(&mut patproj.pattern.fabric, self.fabric.clone());
    window.emit("fabric:update", base64::encode(borsh::to_vec(&self.fabric)?))?;

    if self.fabric.width < old_fabric.width || self.fabric.height < old_fabric.height {
      let extra_stitches = patproj
        .pattern
        .remove_stitches_outside_bounds(0, 0, self.fabric.width, self.fabric.height);
      window.emit("stitches:remove_many", base64::encode(borsh::to_vec(&extra_stitches)?))?;
      if self.extra_stitches.get().is_none() {
        self.extra_stitches.set(extra_stitches).unwrap();
      }
    }

    if self.old_fabric.get().is_none() {
      self.old_fabric.set(old_fabric).unwrap();
    }

    Ok(())
  }

  /// Restore the the previous fabric properties.
  ///
  /// **Emits:**
  /// - `fabric:update` with the previous fabric properties.
  /// - `stitches:add_many` with the stitches that were removed when the fabric properties were updated.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_fabric = self.old_fabric.get().unwrap();
    patproj.pattern.fabric = old_fabric.clone();
    window.emit("fabric:update", base64::encode(borsh::to_vec(old_fabric)?))?;

    if let Some(extra_stitches) = self.extra_stitches.get() {
      patproj.pattern.add_stitches(extra_stitches.clone());
      window.emit("stitches:add_many", base64::encode(borsh::to_vec(extra_stitches)?))?;
    }

    Ok(())
  }
}
