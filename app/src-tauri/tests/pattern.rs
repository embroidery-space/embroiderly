use embroiderly::commands;
use embroiderly::state::{HistoryState, PatternsState};
use embroiderly_pattern::PatternInfo;
use tauri::Manager as _;

mod utils;

#[test]
fn updates_pattern_info() {
  let (app, webview) = setup_test_app!(commands: [commands::core::pattern::update_pattern_info]);
  let pattern_id = utils::create_test_pattern(&app);

  let new_pattern_info = PatternInfo {
    title: "Updated Title".to_string(),
    author: "Test Author".to_string(),
    copyright: "2025".to_string(),
    description: "Test Description".to_string(),
  };
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "update_pattern_info",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&new_pattern_info).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.pattern.info, new_pattern_info);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}
