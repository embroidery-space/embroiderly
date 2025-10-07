use embroiderly::commands;
use embroiderly::state::{HistoryState, PatternsState};
use embroiderly_pattern::{DisplayMode, LayersVisibility};
use rstest::rstest;
use tauri::Manager as _;

mod utils;

#[rstest]
#[case(DisplayMode::Stitches)]
#[case(DisplayMode::Solid)]
#[case(DisplayMode::Mixed)]
fn sets_display_mode(#[case] mode: DisplayMode) {
  let (app, webview) = setup_test_app!(commands: [commands::core::display::set_display_mode]);
  let pattern_id = utils::create_test_pattern(&app);

  assert!(
    invoke_ipc!(
      &webview,
      cmd: "set_display_mode",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "mode": mode.to_string() })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.display_settings.display_mode, mode);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}

#[rstest]
#[case(true)]
#[case(false)]
fn show_symbols(#[case] value: bool) {
  let (app, webview) = setup_test_app!(commands: [commands::core::display::show_symbols]);
  let pattern_id = utils::create_test_pattern(&app);

  assert!(
    invoke_ipc!(
      &webview,
      cmd: "show_symbols",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "value": value })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.display_settings.show_symbols, value);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}

#[test]
fn sets_layers_visibility() {
  let (app, webview) = setup_test_app!(commands: [commands::core::display::set_layers_visibility]);
  let pattern_id = utils::create_test_pattern(&app);

  let new_layers_visibility = LayersVisibility {
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
    grid: false,
    rulers: true,
  };
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "set_layers_visibility",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&new_layers_visibility).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.display_settings.layers_visibility, new_layers_visibility);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}
