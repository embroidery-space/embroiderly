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
  added_index: OnceLock<u32>,
}

impl AddLayerAction {
  pub const fn new() -> Self {
    Self {
      added_index: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for AddLayerAction {
  /// Add a new layer to the pattern.
  ///
  /// **Emits:**
  /// - `layers:add` with the actual index and the new layer.
  /// - `app:pattern-changed`.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let layer = Layer::default();
    let index = patproj.pattern.layers.push(layer.clone());

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
  /// - `layers:remove` with the layer actual index.
  /// - `app:pattern-changed`.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let index = *self.added_index.get().unwrap();

    patproj.pattern.layers.remove(index);

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
  /// Remove the layer at the given actual index from the pattern.
  ///
  /// **Emits:**
  /// - `layers:remove` with the layer actual index.
  /// - `app:pattern-changed`.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let layer = patproj.pattern.layers.remove(self.layer_index);

    if self.removed_layer.get().is_none() {
      self.removed_layer.set(layer).unwrap();
    }

    window.emit("layers:remove", self.layer_index)?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }

  /// Re-insert the removed layer at its original actual index.
  ///
  /// **Emits:**
  /// - `layers:add` with `(index, layer)`.
  /// - `app:pattern-changed`.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let layer = self.removed_layer.get().unwrap().clone();

    patproj.pattern.layers.insert(self.layer_index, layer.clone());

    window.emit("layers:add", base64::encode(borsh::to_vec(&(self.layer_index, layer))?))?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct RenameLayerEvent {
  layer_index: u32,
  name: String,
}

#[derive(Clone)]
pub struct RenameLayerAction {
  layer_index: u32,
  name: String,
  old_name: OnceLock<String>,
}

impl RenameLayerAction {
  pub const fn new(layer_index: u32, name: String) -> Self {
    Self {
      layer_index,
      name,
      old_name: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for RenameLayerAction {
  /// Renames the layer at the given actual index.
  ///
  /// **Emits:**
  /// - `layers:rename` with `{ layerIndex, name }`.
  /// - `app:pattern-changed`.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let layer = &mut patproj.pattern.layers[self.layer_index];

    if self.old_name.get().is_none() {
      self.old_name.set(layer.name.clone()).unwrap();
    }

    layer.name.clone_from(&self.name);

    window.emit(
      "layers:rename",
      RenameLayerEvent {
        layer_index: self.layer_index,
        name: self.name.clone(),
      },
    )?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }

  /// Restores the previous name of the layer.
  ///
  /// **Emits:**
  /// - `layers:rename` with `{ layerIndex, name }`.
  /// - `app:pattern-changed`.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_name = self.old_name.get().unwrap().clone();
    let layer = &mut patproj.pattern.layers[self.layer_index];

    layer.name.clone_from(&old_name);

    window.emit(
      "layers:rename",
      RenameLayerEvent {
        layer_index: self.layer_index,
        name: old_name,
      },
    )?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LayerVisibility {
  pub visible: bool,

  pub fullstitches_visible: bool,
  pub petitestitches_visible: bool,

  pub halfstitches_visible: bool,
  pub quarterstitches_visible: bool,

  pub backstitches_visible: bool,
  pub straightstitches_visible: bool,

  pub frenchknots_visible: bool,
  pub beads_visible: bool,

  pub specialstitches_visible: bool,
}

impl From<&Layer> for LayerVisibility {
  fn from(layer: &Layer) -> Self {
    Self {
      visible: layer.visible,

      fullstitches_visible: layer.fullstitches_visible,
      petitestitches_visible: layer.petitestitches_visible,

      halfstitches_visible: layer.halfstitches_visible,
      quarterstitches_visible: layer.quarterstitches_visible,

      backstitches_visible: layer.backstitches_visible,
      straightstitches_visible: layer.straightstitches_visible,

      frenchknots_visible: layer.frenchknots_visible,
      beads_visible: layer.beads_visible,

      specialstitches_visible: layer.specialstitches_visible,
    }
  }
}

impl LayerVisibility {
  pub const fn apply_to(&self, layer: &mut Layer) {
    layer.visible = self.visible;

    layer.fullstitches_visible = self.fullstitches_visible;
    layer.petitestitches_visible = self.petitestitches_visible;

    layer.halfstitches_visible = self.halfstitches_visible;
    layer.quarterstitches_visible = self.quarterstitches_visible;

    layer.backstitches_visible = self.backstitches_visible;
    layer.straightstitches_visible = self.straightstitches_visible;

    layer.frenchknots_visible = self.frenchknots_visible;
    layer.beads_visible = self.beads_visible;

    layer.specialstitches_visible = self.specialstitches_visible;
  }
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct LayerVisibilityEvent {
  layer_index: u32,
  visibility: LayerVisibility,
}

#[derive(Clone)]
pub struct UpdateLayerVisibilityAction {
  layer_index: u32,
  visibility: LayerVisibility,
  old_visibility: OnceLock<LayerVisibility>,
}

impl UpdateLayerVisibilityAction {
  pub const fn new(layer_index: u32, visibility: LayerVisibility) -> Self {
    Self {
      layer_index,
      visibility,
      old_visibility: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for UpdateLayerVisibilityAction {
  /// Updates the visibility settings of a layer.
  ///
  /// **Emits:**
  /// - `layers:update_visibility` with `{ layerIndex, visibility }`.
  /// - `app:pattern-changed`.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let layer = &mut patproj.pattern.layers[self.layer_index];

    if self.old_visibility.get().is_none() {
      self.old_visibility.set(LayerVisibility::from(&*layer)).unwrap();
    }

    self.visibility.apply_to(layer);

    window.emit(
      "layers:update_visibility",
      LayerVisibilityEvent {
        layer_index: self.layer_index,
        visibility: self.visibility.clone(),
      },
    )?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }

  /// Restores the previous visibility settings of the layer.
  ///
  /// **Emits:**
  /// - `layers:update_visibility` with `{ layerIndex, visibility }`.
  /// - `app:pattern-changed`.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_visibility = self.old_visibility.get().unwrap();
    let layer = &mut patproj.pattern.layers[self.layer_index];

    old_visibility.apply_to(layer);

    window.emit(
      "layers:update_visibility",
      LayerVisibilityEvent {
        layer_index: self.layer_index,
        visibility: old_visibility.clone(),
      },
    )?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }
}

#[derive(Clone)]
pub struct MoveLayerAction {
  old_position: u32,
  new_position: u32,
  old_positions: OnceLock<Vec<u32>>,
}

impl MoveLayerAction {
  pub const fn new(old_position: u32, new_position: u32) -> Self {
    Self {
      old_position,
      new_position,
      old_positions: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for MoveLayerAction {
  /// Moves a layer from one visual position to another.
  ///
  /// **Emits:**
  /// - `layers:move` with the new positions array.
  /// - `app:pattern-changed`.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    if self.old_positions.get().is_none() {
      self
        .old_positions
        .set(patproj.pattern.layers.positions().to_vec())
        .unwrap();
    }

    let new_positions = patproj.pattern.layers.move_layer(self.old_position, self.new_position);

    window.emit("layers:move", new_positions)?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }

  /// Restores the previous visual order.
  ///
  /// **Emits:**
  /// - `layers:move` with the restored positions array.
  /// - `app:pattern-changed`.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_positions = self.old_positions.get().unwrap();

    patproj.pattern.layers.set_positions(old_positions.clone());

    window.emit("layers:move", old_positions)?;
    window.emit("app:pattern-changed", patproj.id.to_string())?;

    Ok(())
  }
}
