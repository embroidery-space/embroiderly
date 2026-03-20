use std::sync::OnceLock;

use anyhow::Result;
use embroiderly_pattern::{Layer, PatternProject};
use tauri::{Emitter as _, WebviewWindow};

use super::Action;
use crate::utils::base64;

#[cfg(test)]
#[path = "layers.test.rs"]
mod tests;

#[derive(Clone)]
pub struct AddLayerAction {
  name: String,
  added_index: OnceLock<u32>,
}

impl AddLayerAction {
  pub const fn new(name: String) -> Self {
    Self {
      name,
      added_index: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for AddLayerAction {
  /// Add a new layer to the pattern.
  ///
  /// **Emits:**
  /// - `layers:add` with the index and the new layer (borsh-encoded).
  /// - `app:pattern-changed`.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let layer = Layer::new(&self.name);
    let index = patproj.pattern.add_layer(layer.clone()) as u32;

    if self.added_index.get().is_none() {
      self.added_index.set(index).unwrap();
    }

    window.emit("layers:add", base64::encode(borsh::to_vec(&(index, layer))?))?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }

  /// Remove the added layer from the pattern.
  ///
  /// **Emits:**
  /// - `layers:remove` with the layer index.
  /// - `app:pattern-changed`.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let index = *self.added_index.get().unwrap();

    patproj.pattern.remove_layer(index as usize);

    window.emit("layers:remove", index)?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }
}

#[derive(Clone)]
pub struct RemoveLayerAction {
  layer_index: u32,
  removed_layer: OnceLock<Layer>,
}

impl RemoveLayerAction {
  pub const fn new(layer_index: u32) -> Self {
    Self {
      layer_index,
      removed_layer: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for RemoveLayerAction {
  /// Remove the layer at the given index from the pattern.
  ///
  /// **Emits:**
  /// - `layers:remove` with the layer index.
  /// - `app:pattern-changed`.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let layer = patproj.pattern.remove_layer(self.layer_index as usize);

    if self.removed_layer.get().is_none() {
      self.removed_layer.set(layer).unwrap();
    }

    window.emit("layers:remove", self.layer_index)?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }

  /// Re-insert the removed layer at its original index.
  ///
  /// **Emits:**
  /// - `layers:add` with `(index, layer)`.
  /// - `app:pattern-changed`.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let layer = self.removed_layer.get().unwrap().clone();

    patproj.pattern.layers.insert(self.layer_index as usize, layer.clone());

    window.emit("layers:add", base64::encode(borsh::to_vec(&(self.layer_index, layer))?))?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }
}
