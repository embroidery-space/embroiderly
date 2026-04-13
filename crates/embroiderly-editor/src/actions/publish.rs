use embroiderly_pattern::{PatternProject, PdfExportOptions};

use crate::EditorEvent;
use crate::error::Result;

#[cfg(test)]
#[path = "publish.test.rs"]
mod tests;

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum PublishAction {
  UpdatePdfExportOptions {
    options: PdfExportOptions,
    old_options: Option<PdfExportOptions>,
  },
}

impl PublishAction {
  pub fn perform(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::UpdatePdfExportOptions { options, old_options } => {
        let prev = std::mem::replace(&mut patproj.publish_settings.pdf, *options);
        old_options.get_or_insert(prev);
        Ok(vec![
          EditorEvent::PublishUpdatePdf(*options),
          EditorEvent::PatternChanged(patproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::UpdatePdfExportOptions { old_options, .. } => {
        let old = old_options
          .take()
          .ok_or(crate::error::EditorError::ActionNotPerformed)?;
        patproj.publish_settings.pdf = old;
        Ok(vec![
          EditorEvent::PublishUpdatePdf(old),
          EditorEvent::PatternChanged(patproj.id),
        ])
      }
    }
  }
}
