use embroiderly::commands;
use embroiderly::state::{HistoryState, PatternsState};
use embroiderly_pattern::{Grid, GridLine};
use tauri::Manager as _;

mod utils;

#[test]
fn updates_grid() {
  let (app, webview) = setup_test_app!(commands: [commands::core::grid::update_grid]);
  let pattern_id = utils::create_test_pattern(&app);

  let new_grid = Grid {
    major_lines_interval: 5,
    minor_lines: GridLine {
      color: "#FF0000".to_string(),
      thickness: 0.1,
    },
    major_lines: GridLine {
      color: "#00FF00".to_string(),
      thickness: 0.2,
    },
  };
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "update_grid",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&new_grid).unwrap()),
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
}
