use embroiderly_pattern::{EmbroiderlyProject, ReferenceImage, ReferenceImageSettings};

use crate::EditorEvent;
use crate::error::Result;

#[cfg(test)]
#[path = "image.test.rs"]
mod tests;

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
  pub fn perform(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::SetReferenceImage { image, old_image } => {
        let prev = std::mem::replace(&mut embproj.reference_image, image.clone());
        old_image.get_or_insert(prev);
        Ok(vec![
          EditorEvent::ImageSet(image.clone()),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::UpdateSettings { settings, old_settings } => {
        let prev = std::mem::replace(&mut embproj.reference_image.as_mut().unwrap().settings, *settings);
        old_settings.get_or_insert(prev);
        Ok(vec![
          EditorEvent::ImageSettingsUpdate(*settings),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::SetReferenceImage { old_image, .. } => {
        let prev = old_image.take().ok_or(crate::error::Error::ActionNotPerformed)?;
        embproj.reference_image.clone_from(&prev);
        Ok(vec![
          EditorEvent::ImageSet(prev),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::UpdateSettings { old_settings, .. } => {
        let prev = old_settings.take().ok_or(crate::error::Error::ActionNotPerformed)?;
        if let Some(image) = embproj.reference_image.as_mut() {
          image.settings = prev;
        }
        Ok(vec![
          EditorEvent::ImageSettingsUpdate(prev),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }
}
