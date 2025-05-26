use crate::error::CommandResult;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};

#[tauri::command]
pub fn undo<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut history = history.write().unwrap();
  let mut patterns = patterns.write().unwrap();
  if let Some(action) = history.get_mut(&pattern_id).undo() {
    action.revoke(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;
  }
  Ok(())
}

#[tauri::command]
pub fn redo<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut history = history.write().unwrap();
  let mut patterns = patterns.write().unwrap();
  if let Some(action) = history.get_mut(&pattern_id).redo() {
    action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;
  }
  Ok(())
}
