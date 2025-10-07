use embroiderly::commands;
use embroiderly::state::{HistoryState, PatternsState};
use embroiderly_pattern::{ImageExportOptions, PdfExportOptions};
use tauri::Manager as _;

mod utils;

#[test]
fn updates_pdf_export_options() {
  let (app, webview) = setup_test_app!(commands: [commands::core::publish::update_pdf_export_options]);
  let pattern_id = utils::create_test_pattern(&app);

  let new_pdf_options = PdfExportOptions {
    monochrome: false,
    color: true,
    center_frames: true,
    enumerate_frames: false,
    frame_options: ImageExportOptions {
      frame_size: Some((50, 60)),
      cell_size: 20.0,
      preserved_overlap: Some(5),
      show_grid_line_numbers: false,
      show_centering_marks: true,
    },
  };
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "update_pdf_export_options",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&new_pdf_options).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.publish_settings.pdf, new_pdf_options);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}
