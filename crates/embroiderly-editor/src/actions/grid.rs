use embroiderly_pattern::{EmbroiderlyProject, Grid};

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
  pub fn perform(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Update { grid, old_grid } => {
        let prev = std::mem::replace(&mut embproj.display_settings.grid, grid.clone());
        old_grid.get_or_insert(prev);
        Ok(vec![
          EditorEvent::GridUpdate(grid.clone()),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Update { old_grid, .. } => {
        let old = old_grid.take().ok_or(crate::error::Error::ActionNotPerformed)?;
        embproj.display_settings.grid = old.clone();
        Ok(vec![
          EditorEvent::GridUpdate(old),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }
}
