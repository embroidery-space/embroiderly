use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

use embroiderly::commands;
use embroiderly::state::{HistoryState, PatternsState};
use embroiderly_pattern::Grid;
use tauri::{Listener as _, Manager as _};

mod utils;

#[test]
fn undoes_single_action() {
  let (app, webview) = setup_test_app!(commands: [
    commands::core::grid::update_grid,
    commands::core::history::undo
  ]);
  let pattern_id = utils::create_test_pattern(&app);

  let original_grid = {
    let patterns_state = app.state::<PatternsState>();
    let patterns_manager = patterns_state.read().unwrap();
    let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
    patproj.display_settings.grid.clone()
  };
  let new_grid = Grid {
    major_lines_interval: 5,
    ..original_grid.clone()
  };
  invoke_ipc!(
    &webview,
    cmd: "update_grid",
    body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&new_grid).unwrap()),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();

  let checkpoint_received = Arc::new(AtomicBool::new(false));
  webview.once("app:pattern-checkpoint", {
    let checkpoint_received = checkpoint_received.clone();
    move |_| checkpoint_received.store(true, Ordering::Relaxed)
  });

  assert!(
    invoke_ipc!(
      &webview,
      cmd: "undo",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "single": true })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  assert!(checkpoint_received.load(Ordering::Relaxed));

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();
  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.display_settings.grid, original_grid);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();
  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 0);
  assert_eq!(history.redo_stack_len(), 1);
}

#[test]
fn redoes_single_action() {
  let (app, webview) = setup_test_app!(commands: [
    commands::core::grid::update_grid,
    commands::core::history::undo,
    commands::core::history::redo
  ]);
  let pattern_id = utils::create_test_pattern(&app);

  let original_grid = {
    let patterns_state = app.state::<PatternsState>();
    let patterns_manager = patterns_state.read().unwrap();
    let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
    patproj.display_settings.grid.clone()
  };
  let new_grid = Grid {
    major_lines_interval: 5,
    ..original_grid.clone()
  };
  invoke_ipc!(
    &webview,
    cmd: "update_grid",
    body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&new_grid).unwrap()),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();

  invoke_ipc!(
    &webview,
    cmd: "undo",
    body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "single": true })),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "redo",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "single": true })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();
  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.display_settings.grid, new_grid);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();
  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
  assert_eq!(history.redo_stack_len(), 0);
}

#[test]
fn starts_and_ends_transaction() {
  let (app, webview) = setup_test_app!(commands: [
    commands::core::grid::update_grid,
    commands::core::history::start_transaction,
    commands::core::history::end_transaction
  ]);
  let pattern_id = utils::create_test_pattern(&app);

  let original_grid = {
    let patterns_state = app.state::<PatternsState>();
    let patterns_manager = patterns_state.read().unwrap();
    let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
    patproj.display_settings.grid.clone()
  };

  assert!(
    invoke_ipc!(
      &webview,
      cmd: "start_transaction",
      body: tauri::ipc::InvokeBody::default(),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let grid_1 = Grid {
    major_lines_interval: 5,
    ..original_grid.clone()
  };
  invoke_ipc!(
    &webview,
    cmd: "update_grid",
    body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&grid_1).unwrap()),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();

  let grid_2 = Grid {
    major_lines_interval: 8,
    ..original_grid.clone()
  };
  invoke_ipc!(
    &webview,
    cmd: "update_grid",
    body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&grid_2).unwrap()),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();

  assert!(
    invoke_ipc!(
      &webview,
      cmd: "end_transaction",
      body: tauri::ipc::InvokeBody::default(),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();
  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}
