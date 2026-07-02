use embroiderly_pattern::{DisplaySettings, EmbroiderlyProject};

use crate::EditorEvent;
use crate::error::Result;

#[cfg(test)]
#[path = "display.test.rs"]
mod tests;

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum DisplayAction {
  Update {
    display_settings: DisplaySettings,
    old_display_settings: Option<DisplaySettings>,
  },
}

impl DisplayAction {
  pub fn perform(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Update {
        display_settings,
        old_display_settings,
      } => {
        let prev = std::mem::replace(&mut embproj.display_settings, display_settings.clone());
        old_display_settings.get_or_insert(prev);
        Ok(vec![
          EditorEvent::DisplayUpdate(display_settings.clone()),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Update {
        old_display_settings, ..
      } => {
        let old = old_display_settings
          .take()
          .ok_or(crate::error::Error::ActionNotPerformed)?;
        embproj.display_settings = old.clone();
        Ok(vec![
          EditorEvent::DisplayUpdate(old),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }
}
