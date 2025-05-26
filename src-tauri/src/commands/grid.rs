use crate::core::actions::{Action, UpdateGridPropertiesAction};
use crate::core::pattern::Grid;
use crate::error::CommandResult;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};

#[tauri::command]
pub fn update_grid<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  let (pattern_id, grid) = parse_command_payload!(request, Grid);

  let mut patterns = patterns.write().unwrap();
  let action = UpdateGridPropertiesAction::new(grid);
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  Ok(())
}
