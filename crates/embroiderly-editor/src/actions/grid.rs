use embroiderly_pattern::{Grid, PatternProject};

use crate::EditorEvent;
use crate::error::Result;

#[cfg(test)]
#[path = "grid.test.rs"]
mod tests;

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum GridAction {
  Update { grid: Grid, old_grid: Option<Grid> },
}

impl GridAction {
  pub fn perform(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Update { grid, old_grid } => {
        let prev = std::mem::replace(&mut patproj.display_settings.grid, grid.clone());
        old_grid.get_or_insert(prev);
        Ok(vec![
          EditorEvent::GridUpdate(grid.clone()),
          EditorEvent::PatternChanged(patproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Update { old_grid, .. } => {
        let old = old_grid.take().ok_or(crate::error::Error::ActionNotPerformed)?;
        patproj.display_settings.grid = old.clone();
        Ok(vec![
          EditorEvent::GridUpdate(old),
          EditorEvent::PatternChanged(patproj.id),
        ])
      }
    }
  }
}
