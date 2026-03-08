use embroiderly::commands;
use embroiderly::state::{HistoryState, PatternsState};
use embroiderly_pattern::{DisplayMode, DisplaySettings, LayersVisibility};
use tauri::Manager as _;

mod utils;

#[test]
fn updates_display_settings() {
  let (app, webview) = setup_test_app!(commands: [commands::core::display::update_display_settings]);
  let pattern_id = utils::create_test_pattern(&app);

  let new_display_settings = DisplaySettings {
    display_mode: DisplayMode::Stitches,
    show_symbols: true,
    show_grid: false,
    show_rulers: false,
    layers_visibility: LayersVisibility {
      reference_image: false,
      fullstitches: true,
      petitestitches: false,
      halfstitches: true,
      quarterstitches: false,
      backstitches: true,
      straightstitches: false,
      frenchknots: true,
      beads: false,
      specialstitches: true,
    },
    ..DisplaySettings::default()
  };

  assert!(
    invoke_ipc!(
      &webview,
      cmd: "update_display_settings",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&new_display_settings).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.display_settings, new_display_settings);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}
