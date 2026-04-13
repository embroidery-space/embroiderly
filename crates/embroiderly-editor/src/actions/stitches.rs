use embroiderly_pattern::{PatternProject, Stitch};

#[cfg(test)]
#[path = "stitches.test.rs"]
mod tests;

use crate::EditorEvent;
use crate::error::{EditorError, Result};

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum StitchAction {
  Add {
    layer_index: u32,
    stitch: Stitch,
    conflicts: Option<Vec<Stitch>>,
  },
  Remove {
    layer_index: u32,
    target_stitch: Stitch,
    actual_stitch: Option<Stitch>,
  },
}

impl StitchAction {
  pub fn perform(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Add {
        layer_index,
        stitch,
        conflicts,
      } => {
        let removed = patproj.pattern.add_stitch(*layer_index, *stitch);
        let mut events = vec![
          EditorEvent::StitchesAdd {
            layer_index: *layer_index,
            stitches: vec![*stitch],
          },
          EditorEvent::StitchesRemove {
            layer_index: *layer_index,
            stitches: removed.clone(),
          },
        ];
        conflicts.get_or_insert(removed);
        events.push(EditorEvent::PatternChanged(patproj.id));
        Ok(events)
      }
      Self::Remove {
        layer_index,
        target_stitch,
        actual_stitch,
      } => {
        let removed = patproj
          .pattern
          .remove_stitch(*layer_index, *target_stitch)
          .ok_or(EditorError::StitchNotFound)?;
        actual_stitch.get_or_insert(removed);
        Ok(vec![
          EditorEvent::StitchesRemove {
            layer_index: *layer_index,
            stitches: vec![removed],
          },
          EditorEvent::PatternChanged(patproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Add {
        layer_index,
        stitch,
        conflicts,
      } => {
        let saved = conflicts.take().ok_or(EditorError::ActionNotPerformed)?;
        patproj.pattern.remove_stitch(*layer_index, *stitch);
        patproj.pattern.add_stitches(*layer_index, saved.clone());
        Ok(vec![
          EditorEvent::StitchesRemove {
            layer_index: *layer_index,
            stitches: vec![*stitch],
          },
          EditorEvent::StitchesAdd {
            layer_index: *layer_index,
            stitches: saved,
          },
          EditorEvent::PatternChanged(patproj.id),
        ])
      }
      Self::Remove {
        layer_index,
        actual_stitch,
        ..
      } => {
        let saved = actual_stitch.take().ok_or(EditorError::ActionNotPerformed)?;
        patproj.pattern.add_stitch(*layer_index, saved);
        Ok(vec![
          EditorEvent::StitchesAdd {
            layer_index: *layer_index,
            stitches: vec![saved],
          },
          EditorEvent::PatternChanged(patproj.id),
        ])
      }
    }
  }
}
