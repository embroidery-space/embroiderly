use embroiderly::commands;
use embroiderly::state::{HistoryState, PatternsState};
use tauri::Manager as _;

mod utils;

#[test]
fn adds_layer() {
  let (app, webview) = setup_test_app!(commands: [commands::core::layers::add_layer]);
  let pattern_id = utils::create_test_pattern(&app);

  assert!(
    invoke_ipc!(
      &webview,
      cmd: "add_layer",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "name": "Layer 2" })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.pattern.layers.len(), 2);
  assert_eq!(patproj.pattern.layers[0].name, "Layer 2");

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}

#[test]
fn removes_layer() {
  let (app, webview) = setup_test_app!(commands: [
    commands::core::layers::add_layer,
    commands::core::layers::remove_layer
  ]);
  let pattern_id = utils::create_test_pattern(&app);

  // Add a second layer first.
  invoke_ipc!(
    &webview,
    cmd: "add_layer",
    body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "name": "Layer 2" })),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();

  // Now remove it.
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "remove_layer",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "layerIndex": 0 })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.pattern.layers.len(), 1);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 2);
}

#[test]
fn cannot_remove_last_layer() {
  let (app, webview) = setup_test_app!(commands: [commands::core::layers::remove_layer]);
  let pattern_id = utils::create_test_pattern(&app);

  // Pattern starts with 1 layer — cannot remove it.
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "remove_layer",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "layerIndex": 0 })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_err()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.pattern.layers.len(), 1);
}
