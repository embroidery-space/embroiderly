use embroiderly::commands;
use embroiderly::state::{HistoryState, PatternsState};
use embroiderly_pattern::{Coord, FullStitch, FullStitchKind, Stitch};
use tauri::Manager as _;

mod utils;

#[test]
fn adds_stitch() {
  let (app, webview) = setup_test_app!(commands: [commands::core::stitches::add_stitch]);
  let pattern_id = utils::create_test_pattern(&app);

  let stitch = Stitch::Full(FullStitch {
    x: Coord::new(5.0).unwrap(),
    y: Coord::new(10.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Full,
  });
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "add_stitch",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&stitch).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert!(patproj.pattern.contains_stitch(0, &stitch));

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}

#[test]
fn does_not_add_duplicate_stitch() {
  let (app, webview) = setup_test_app!(commands: [commands::core::stitches::add_stitch]);
  let pattern_id = utils::create_test_pattern(&app);

  let stitch = Stitch::Full(FullStitch {
    x: Coord::new(5.0).unwrap(),
    y: Coord::new(10.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Full,
  });
  invoke_ipc!(
    &webview,
    cmd: "add_stitch",
    body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&stitch).unwrap()),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "add_stitch",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&stitch).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}

#[test]
fn removes_stitch() {
  let (app, webview) = setup_test_app!(commands: [
    commands::core::stitches::add_stitch,
    commands::core::stitches::remove_stitch
  ]);
  let pattern_id = utils::create_test_pattern(&app);

  let stitch = Stitch::Full(FullStitch {
    x: Coord::new(5.0).unwrap(),
    y: Coord::new(10.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Full,
  });
  invoke_ipc!(
    &webview,
    cmd: "add_stitch",
    body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&stitch).unwrap()),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "remove_stitch",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&stitch).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert!(!patproj.pattern.contains_stitch(0, &stitch));

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 2);
}
