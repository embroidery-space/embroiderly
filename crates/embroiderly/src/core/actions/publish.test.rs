use embroiderly_pattern::{ImageExportOptions, PatternProject, PdfExportOptions};
use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindowBuilder, generate_context};

use super::{Action, UpdatePdfExportOptionsAction};
use crate::utils::base64;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

#[test]
fn test_update_pdf_export_options() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .title("Test")
    .build()
    .unwrap();

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
  let action = UpdatePdfExportOptionsAction::new(options);

  // Test executing the command.
  {
    let event_id = window.listen("publish:update-pdf", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: PdfExportOptions = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected, options);
    });

    action.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the command.
  {
    let event_id = window.listen("publish:update-pdf", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: PdfExportOptions = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected, PdfExportOptions::default());
    });

    action.revoke(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }
}
