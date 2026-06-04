use embroiderly_pattern::{EmbroiderlyProject, PdfExportOptions};

use crate::actions::PublishAction;
use crate::{EditorAction, EditorEvent};

#[test]
fn test_update_pdf_export_options() {
  let mut embproj = EmbroiderlyProject::default();
  let options = PdfExportOptions {
    frame_size: (50, 100),
    preserved_overlap: 5,
    show_grid_line_numbers: true,
    show_centering_marks: true,
  };
  let mut action = EditorAction::Publish(PublishAction::UpdatePdfExportOptions {
    options,
    old_options: None,
  });

  // Test executing the command.
  {
    let events = action.perform(&mut embproj).unwrap();
    let EditorEvent::PublishUpdatePdf(opts) = &events[0] else {
      panic!("expected PublishUpdatePdf");
    };
    assert_eq!(opts, &options);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the command.
  {
    let events = action.revoke(&mut embproj).unwrap();
    let EditorEvent::PublishUpdatePdf(opts) = &events[0] else {
      panic!("expected PublishUpdatePdf");
    };
    assert_eq!(opts, &PdfExportOptions::default());

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}
