use embroiderly_pattern::{EmbroiderlyProject, PatternPdf};

use crate::actions::PatternPdfAction;
use crate::{EditorAction, EditorEvent};

#[test]
fn test_update_pattern_pdf() {
  let mut embproj = EmbroiderlyProject::default();
  let template = PatternPdf {
    template: String::from("lorem ipsum"),
  };
  let mut action = EditorAction::PatternPdf(PatternPdfAction::UpdatePatternPdf {
    template: template.clone(),
    old_template: None,
  });

  // Test executing the command.
  {
    let events = action.perform(&mut embproj).unwrap();
    let EditorEvent::PatternPdfUpdate(pdf) = &events[0] else {
      panic!("expected PatternPdfUpdate");
    };
    assert_eq!(pdf, &template);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the command.
  {
    let events = action.revoke(&mut embproj).unwrap();
    let EditorEvent::PatternPdfUpdate(pdf) = &events[0] else {
      panic!("expected PatternPdfUpdate");
    };
    assert_eq!(pdf, &PatternPdf::default());

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}
