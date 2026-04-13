use embroiderly_pattern::{PatternProject, ReferenceImage, ReferenceImageSettings};

#[cfg(test)]
#[path = "image.test.rs"]
mod tests;

use crate::EditorEvent;
use crate::error::Result;

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum ImageAction {
  SetReferenceImage {
    image: Option<ReferenceImage>,
    old_image: Option<Option<ReferenceImage>>,
  },
  UpdateSettings {
    settings: ReferenceImageSettings,
    old_settings: Option<ReferenceImageSettings>,
  },
}

impl ImageAction {
  pub fn perform(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::SetReferenceImage { image, old_image } => {
        let prev = std::mem::replace(&mut patproj.reference_image, image.clone());
        old_image.get_or_insert(prev);
        Ok(vec![
          EditorEvent::ImageSet(image.clone()),
          EditorEvent::PatternChanged(patproj.id),
        ])
      }
      Self::UpdateSettings { settings, old_settings } => {
        let prev = std::mem::replace(&mut patproj.reference_image.as_mut().unwrap().settings, *settings);
        old_settings.get_or_insert(prev);
        Ok(vec![
          EditorEvent::ImageSettingsUpdate(*settings),
          EditorEvent::PatternChanged(patproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::SetReferenceImage { old_image, .. } => {
        let prev = old_image.take().ok_or(crate::error::EditorError::ActionNotPerformed)?;
        patproj.reference_image.clone_from(&prev);
        Ok(vec![
          EditorEvent::ImageSet(prev),
          EditorEvent::PatternChanged(patproj.id),
        ])
      }
      Self::UpdateSettings { old_settings, .. } => {
        let prev = old_settings
          .take()
          .ok_or(crate::error::EditorError::ActionNotPerformed)?;
        if let Some(image) = patproj.reference_image.as_mut() {
          image.settings = prev;
        }
        Ok(vec![
          EditorEvent::ImageSettingsUpdate(prev),
          EditorEvent::PatternChanged(patproj.id),
        ])
      }
    }
  }
}
