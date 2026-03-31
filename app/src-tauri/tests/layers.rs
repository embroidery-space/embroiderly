use embroiderly::commands;
use embroiderly::state::{HistoryState, PatternsState};
use tauri::Manager as _;

fn visibility_all_true() -> serde_json::Value {
  serde_json::json!({
    "visible": true,

    "fullstitchesVisible": true,
    "petitestitchesVisible": true,

    "halfstitchesVisible": true,
    "quarterstitchesVisible": true,

    "backstitchesVisible": true,
    "straightstitchesVisible": true,

    "frenchknotsVisible": true,
    "beadsVisible": true,

    "specialstitchesVisible": true,
  })
}

mod utils;

#[test]
fn adds_layer() {
  let (app, webview) = setup_test_app!(commands: [commands::core::layers::add_layer]);
  let pattern_id = utils::create_test_pattern(&app);

  assert!(
    invoke_ipc!(
      &webview,
      cmd: "add_layer",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({})),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.pattern.layers.len(), 2);
  assert_eq!(patproj.pattern.layers[0].name, "");

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
    body: tauri::ipc::InvokeBody::Json(serde_json::json!({})),
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

#[test]
fn renames_layer() {
  let (app, webview) = setup_test_app!(commands: [commands::core::layers::rename_layer]);
  let pattern_id = utils::create_test_pattern(&app);

  assert!(
    invoke_ipc!(
      &webview,
      cmd: "rename_layer",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "layerIndex": 0, "name": "My Layer" })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.pattern.layers[0].name, "My Layer");

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}

#[test]
fn updates_layer_visibility() {
  let (app, webview) = setup_test_app!(commands: [commands::core::layers::update_layer_visibility]);
  let pattern_id = utils::create_test_pattern(&app);

  let mut visibility = visibility_all_true();
  visibility["visible"] = serde_json::json!(false);
  visibility["fullstitchesVisible"] = serde_json::json!(false);

  assert!(
    invoke_ipc!(
      &webview,
      cmd: "update_layer_visibility",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "layerIndex": 0, "visibility": visibility })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert!(!patproj.pattern.layers[0].visible);
  assert!(!patproj.pattern.layers[0].fullstitches_visible);
  assert!(patproj.pattern.layers[0].petitestitches_visible);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}

#[test]
fn moves_layer() {
  let (app, webview) = setup_test_app!(commands: [
    commands::core::layers::add_layer,
    commands::core::layers::rename_layer,
    commands::core::layers::move_layer
  ]);
  let pattern_id = utils::create_test_pattern(&app);

  // Add a second layer and name both so we can verify order.
  invoke_ipc!(
    &webview,
    cmd: "add_layer",
    body: tauri::ipc::InvokeBody::Json(serde_json::json!({})),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();
  invoke_ipc!(
    &webview,
    cmd: "rename_layer",
    body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "layerIndex": 0, "name": "Layer A" })),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();
  invoke_ipc!(
    &webview,
    cmd: "rename_layer",
    body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "layerIndex": 1, "name": "Layer B" })),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();

  // Move layer 0 ("A") to position 1.
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "move_layer",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "oldPosition": 0, "newPosition": 1 })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.pattern.layers.len(), 2);
  assert_eq!(patproj.pattern.layers[0].name, "Layer B");
  assert_eq!(patproj.pattern.layers[1].name, "Layer A");

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 4);
}
