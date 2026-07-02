use embroiderly_pattern::{EmbroiderlyProject, PatternInfo};

use crate::EditorEvent;
use crate::error::Result;

#[cfg(test)]
#[path = "pattern.test.rs"]
mod tests;

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum PatternAction {
  UpdateInfo {
    info: PatternInfo,
    old_info: Option<PatternInfo>,
  },
}

impl PatternAction {
  pub fn perform(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::UpdateInfo { info, old_info } => {
        let prev = std::mem::replace(&mut embproj.pattern.info, info.clone());
        old_info.get_or_insert(prev);
        Ok(vec![
          EditorEvent::PatternInfoUpdate(info.clone()),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::UpdateInfo { old_info, .. } => {
        let old = old_info.take().ok_or(crate::error::Error::ActionNotPerformed)?;
        embproj.pattern.info = old.clone();
        Ok(vec![
          EditorEvent::PatternInfoUpdate(old),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }
}
