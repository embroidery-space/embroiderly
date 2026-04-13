use embroiderly_pattern::{Bounds, Fabric, PatternProject, Stitch};

#[cfg(test)]
#[path = "fabric.test.rs"]
mod tests;

use crate::EditorEvent;
use crate::error::Result;

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum FabricAction {
  Update {
    fabric: Fabric,
    old_fabric: Option<Fabric>,
    extra_stitches: Option<Vec<Stitch>>,
  },
}

impl FabricAction {
  pub fn perform(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Update {
        fabric,
        old_fabric,
        extra_stitches,
      } => {
        let prev = std::mem::replace(&mut patproj.pattern.fabric, fabric.clone());
        let mut events = vec![EditorEvent::FabricUpdate(fabric.clone())];

        if fabric.width < prev.width || fabric.height < prev.height {
          let removed = patproj
            .pattern
            .remove_stitches_outside_bounds(Bounds::new(0, 0, fabric.width, fabric.height));
          events.push(EditorEvent::StitchesRemove {
            layer_index: 0,
            stitches: removed.clone(),
          });
          extra_stitches.get_or_insert(removed);
        }

        old_fabric.get_or_insert(prev);
        events.push(EditorEvent::PatternChanged(patproj.id));
        Ok(events)
      }
    }
  }

  pub fn revoke(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Update {
        old_fabric,
        extra_stitches,
        ..
      } => {
        let old = old_fabric.take().ok_or(crate::error::EditorError::ActionNotPerformed)?;
        patproj.pattern.fabric = old.clone();
        let mut events = vec![EditorEvent::FabricUpdate(old)];

        if let Some(stitches) = extra_stitches.take() {
          patproj.pattern.add_stitches(0, stitches.clone());
          events.push(EditorEvent::StitchesAdd {
            layer_index: 0,
            stitches,
          });
        }

        events.push(EditorEvent::PatternChanged(patproj.id));
        Ok(events)
      }
    }
  }
}
