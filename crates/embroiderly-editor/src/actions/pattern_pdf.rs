use embroiderly_pattern::{EmbroiderlyProject, PatternPdf};

use crate::EditorEvent;
use crate::error::Result;

#[cfg(test)]
#[path = "pattern_pdf.test.rs"]
mod tests;

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum PatternPdfAction {
  UpdatePatternPdf {
    template: PatternPdf,
    old_template: Option<PatternPdf>,
  },
}

impl PatternPdfAction {
  pub fn perform(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::UpdatePatternPdf { template, old_template } => {
        let prev = std::mem::replace(&mut embproj.pattern_pdf, template.clone());
        old_template.get_or_insert(prev);
        Ok(vec![
          EditorEvent::PatternPdfUpdate(template.clone()),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::UpdatePatternPdf { old_template, .. } => {
        let old = old_template.take().ok_or(crate::error::Error::ActionNotPerformed)?;
        embproj.pattern_pdf = old.clone();
        Ok(vec![
          EditorEvent::PatternPdfUpdate(old),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }
}
