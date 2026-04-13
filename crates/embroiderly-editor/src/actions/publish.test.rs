use embroiderly_pattern::{ImageExportOptions, PatternProject, PdfExportOptions};

use crate::actions::PublishAction;
use crate::{EditorAction, EditorEvent};

#[test]
fn test_update_pdf_export_options() {
  let mut patproj = PatternProject::default();
  let options = PdfExportOptions {
    monochrome: true,
    color: true,
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
    let events = action.perform(&mut patproj).unwrap();
    let EditorEvent::PublishUpdatePdf(opts) = &events[0] else {
      panic!("expected PublishUpdatePdf");
    };
    assert_eq!(opts, &options);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the command.
  {
    let events = action.revoke(&mut patproj).unwrap();
    let EditorEvent::PublishUpdatePdf(opts) = &events[0] else {
      panic!("expected PublishUpdatePdf");
    };
    assert_eq!(opts, &PdfExportOptions::default());

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }
}
