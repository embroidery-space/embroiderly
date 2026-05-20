use embroiderly_pattern::{EmbroiderlyProject, ImageExportOptions, PdfExportOptions};

use crate::actions::PublishAction;
use crate::{EditorAction, EditorEvent};

#[test]
fn test_update_pdf_export_options() {
  let mut embproj = EmbroiderlyProject::default();
  let options = PdfExportOptions {
    center_frames: true,
    enumerate_frames: true,
    frame_options: ImageExportOptions {
      frame_size: Some((50, 100)),
      cell_size: 20.0,
      preserved_overlap: None,
      show_grid_line_numbers: true,
      show_centering_marks: true,
    },
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
