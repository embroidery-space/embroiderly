use embroiderly_pattern::{EmbroiderlyProject, Layer};

use crate::EditorEvent;
use crate::error::{Error, Result};

#[cfg(test)]
#[path = "layers.test.rs"]
mod tests;

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
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

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum LayerAction {
  Add {
    added_index: Option<u32>,
  },
  Remove {
    layer_index: u32,
    removed_layer: Option<Layer>,
  },
  Rename {
    layer_index: u32,
    name: String,
    old_name: Option<String>,
  },
  UpdateVisibility {
    layer_index: u32,
    visibility: LayerVisibility,
    old_visibility: Option<LayerVisibility>,
  },
  Move {
    old_position: u32,
    new_position: u32,
    old_positions: Option<Vec<u32>>,
  },
}

impl LayerAction {
  pub fn perform(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Add { added_index } => {
        let layer = Layer::default();
        let index = embproj.pattern.layers.push(layer.clone());
        added_index.get_or_insert(index);
        Ok(vec![
          EditorEvent::LayerAdd { index, layer },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::Remove {
        layer_index,
        removed_layer,
      } => {
        let layer = embproj.pattern.layers.remove(*layer_index);
        removed_layer.get_or_insert(layer);
        Ok(vec![
          EditorEvent::LayerRemove(*layer_index),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::Rename {
        layer_index,
        name,
        old_name,
      } => {
        let layer = &mut embproj.pattern.layers[*layer_index];
        old_name.get_or_insert_with(|| layer.name.clone());
        layer.name.clone_from(name);
        Ok(vec![
          EditorEvent::LayerRename {
            layer_index: *layer_index,
            name: name.clone(),
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::UpdateVisibility {
        layer_index,
        visibility,
        old_visibility,
      } => {
        let layer = &mut embproj.pattern.layers[*layer_index];
        old_visibility.get_or_insert_with(|| LayerVisibility::from(&*layer));
        visibility.apply_to(layer);
        Ok(vec![
          EditorEvent::LayerUpdateVisibility {
            layer_index: *layer_index,
            visibility: visibility.clone(),
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::Move {
        old_position,
        new_position,
        old_positions,
      } => {
        old_positions.get_or_insert_with(|| embproj.pattern.layers.positions().to_vec());
        let new_positions = embproj.pattern.layers.move_layer(*old_position, *new_position);
        Ok(vec![
          EditorEvent::LayerMove(new_positions),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Add { added_index } => {
        let index = added_index.take().ok_or(Error::ActionNotPerformed)?;
        embproj.pattern.layers.remove(index);
        Ok(vec![
          EditorEvent::LayerRemove(index),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::Remove {
        layer_index,
        removed_layer,
      } => {
        let layer = removed_layer.take().ok_or(Error::ActionNotPerformed)?;
        embproj.pattern.layers.insert(*layer_index, layer.clone());
        Ok(vec![
          EditorEvent::LayerAdd {
            index: *layer_index,
            layer,
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::Rename {
        layer_index, old_name, ..
      } => {
        let old = old_name.take().ok_or(Error::ActionNotPerformed)?;
        embproj.pattern.layers[*layer_index].name.clone_from(&old);
        Ok(vec![
          EditorEvent::LayerRename {
            layer_index: *layer_index,
            name: old,
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::UpdateVisibility {
        layer_index,
        old_visibility,
        ..
      } => {
        let old = old_visibility.take().ok_or(Error::ActionNotPerformed)?;
        old.apply_to(&mut embproj.pattern.layers[*layer_index]);
        Ok(vec![
          EditorEvent::LayerUpdateVisibility {
            layer_index: *layer_index,
            visibility: old,
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::Move { old_positions, .. } => {
        let old = old_positions.take().ok_or(Error::ActionNotPerformed)?;
        embproj.pattern.layers.set_positions(old.clone());
        Ok(vec![
          EditorEvent::LayerMove(old),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }
}
