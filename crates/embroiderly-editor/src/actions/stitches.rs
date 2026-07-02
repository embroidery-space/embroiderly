use embroiderly_pattern::{EmbroiderlyProject, Stitch};

use crate::EditorEvent;
use crate::error::{Error, Result};

#[cfg(test)]
#[path = "stitches.test.rs"]
mod tests;

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
  RemoveAt {
    layer_index: u32,
    x: f32,
    y: f32,
    removed_stitches: Option<Vec<Stitch>>,
  },
}

impl StitchAction {
  pub fn perform(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Add {
        layer_index,
        stitch,
        conflicts,
      } => {
        let removed = embproj.pattern.add_stitch(*layer_index, *stitch);
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
        events.push(EditorEvent::PatternChanged(embproj.id));
        Ok(events)
      }
      Self::Remove {
        layer_index,
        target_stitch,
        actual_stitch,
      } => {
        let removed = embproj
          .pattern
          .remove_stitch(*layer_index, *target_stitch)
          .ok_or(Error::StitchNotFound)?;
        actual_stitch.get_or_insert(removed);
        Ok(vec![
          EditorEvent::StitchesRemove {
            layer_index: *layer_index,
            stitches: vec![removed],
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::RemoveAt {
        layer_index,
        x,
        y,
        removed_stitches,
      } => {
        let removed = embproj.pattern.remove_stitches_at_point(*layer_index, *x, *y);
        removed_stitches.get_or_insert_with(|| removed.clone());

        if removed.is_empty() {
          return Ok(vec![]);
        }

        Ok(vec![
          EditorEvent::StitchesRemove {
            layer_index: *layer_index,
            stitches: removed,
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Add {
        layer_index,
        stitch,
        conflicts,
      } => {
        let saved = conflicts.take().ok_or(Error::ActionNotPerformed)?;
        embproj.pattern.remove_stitch(*layer_index, *stitch);
        embproj.pattern.add_stitches(*layer_index, saved.clone());
        Ok(vec![
          EditorEvent::StitchesRemove {
            layer_index: *layer_index,
            stitches: vec![*stitch],
          },
          EditorEvent::StitchesAdd {
            layer_index: *layer_index,
            stitches: saved,
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::Remove {
        layer_index,
        actual_stitch,
        ..
      } => {
        let saved = actual_stitch.take().ok_or(Error::ActionNotPerformed)?;
        embproj.pattern.add_stitch(*layer_index, saved);
        Ok(vec![
          EditorEvent::StitchesAdd {
            layer_index: *layer_index,
            stitches: vec![saved],
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::RemoveAt {
        layer_index,
        removed_stitches,
        ..
      } => {
        let saved = removed_stitches.take().ok_or(Error::ActionNotPerformed)?;
        if saved.is_empty() {
          return Ok(vec![]);
        }

        embproj.pattern.add_stitches(*layer_index, saved.clone());

        Ok(vec![
          EditorEvent::StitchesAdd {
            layer_index: *layer_index,
            stitches: saved,
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }
}
