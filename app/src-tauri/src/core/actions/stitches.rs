use std::sync::OnceLock;

use anyhow::Result;
use embroiderly_pattern::{PatternProject, Stitch};
use tauri::{Emitter as _, WebviewWindow};

use super::Action;
use crate::utils::base64;

#[cfg(test)]
#[path = "stitches.test.rs"]
mod tests;

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub struct StitchPayload {
  pub layer_index: u32,
  pub stitch: Stitch,
}

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub struct StitchesEvent {
  pub layer_index: u32,
  pub stitches: Vec<Stitch>,
}

#[derive(Clone)]
pub struct AddStitchAction {
  layer_index: u32,
  stitch: Stitch,
  conflicts: OnceLock<Vec<Stitch>>,
}

impl AddStitchAction {
  pub const fn new(layer_index: u32, stitch: Stitch) -> Self {
    Self {
      layer_index,
      stitch,
      conflicts: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for AddStitchAction {
  /// Add the stitch to the pattern.
  ///
  /// **Emits:**
  /// - `stitches:add` with the added stitch (as array).
  /// - `stitches:remove` with the removed stitches that conflict with the new stitch.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let conflicts = patproj.pattern.add_stitch(self.layer_index, self.stitch);
    window.emit(
      "stitches:add",
      base64::encode(borsh::to_vec(&StitchesEvent {
        layer_index: self.layer_index,
        stitches: vec![self.stitch],
      })?),
    )?;
    window.emit(
      "stitches:remove",
      base64::encode(borsh::to_vec(&StitchesEvent {
        layer_index: self.layer_index,
        stitches: conflicts.clone(),
      })?),
    )?;
    if self.conflicts.get().is_none() {
      self.conflicts.set(conflicts).unwrap();
    }
    window.emit("app:pattern-changed", patproj.id.to_string())?;
    Ok(())
  }

  /// Remove the added stitch from the pattern.
  ///
  /// **Emits:**
  /// - `stitches:remove` with the removed stitch (as array).
  /// - `stitches:add` with the added stitches that were removed when the stitch was added.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let conflicts = self.conflicts.get().unwrap();
    patproj.pattern.remove_stitch(self.layer_index, self.stitch);
    patproj.pattern.add_stitches(self.layer_index, conflicts.clone());
    window.emit(
      "stitches:remove",
      base64::encode(borsh::to_vec(&StitchesEvent {
        layer_index: self.layer_index,
        stitches: vec![self.stitch],
      })?),
    )?;
    window.emit(
      "stitches:add",
      base64::encode(borsh::to_vec(&StitchesEvent {
        layer_index: self.layer_index,
        stitches: conflicts.clone(),
      })?),
    )?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;
    Ok(())
  }
}

#[derive(Clone)]
pub struct RemoveStitchAction {
  layer_index: u32,
  // Actual stitch contains only the necessary stitch properties ...
  target_stitch: Stitch,
  // ... while the actual stitch contains all properties.
  actual_stitch: OnceLock<Stitch>,
}

impl RemoveStitchAction {
  pub const fn new(layer_index: u32, stitch: Stitch) -> Self {
    Self {
      layer_index,
      target_stitch: stitch,
      actual_stitch: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for RemoveStitchAction {
  /// Remove the stitch from the pattern.
  ///
  /// **Emits:**
  /// - `stitches:remove` with the removed stitch (as array).
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let stitch = patproj
      .pattern
      .remove_stitch(self.layer_index, self.target_stitch)
      .unwrap();
    if self.actual_stitch.get().is_none() {
      self.actual_stitch.set(stitch).unwrap();
    }
    window.emit(
      "stitches:remove",
      base64::encode(borsh::to_vec(&StitchesEvent {
        layer_index: self.layer_index,
        stitches: vec![stitch],
      })?),
    )?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;
    Ok(())
  }

  /// Add the removed stitch back to the pattern.
  ///
  /// **Emits:**
  /// - `stitches:add` with the added stitch (as array).
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let stitch = self.actual_stitch.get().unwrap();
    patproj.pattern.add_stitch(self.layer_index, *stitch);
    window.emit(
      "stitches:add",
      base64::encode(borsh::to_vec(&StitchesEvent {
        layer_index: self.layer_index,
        stitches: vec![*stitch],
      })?),
    )?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;
    Ok(())
  }
}
