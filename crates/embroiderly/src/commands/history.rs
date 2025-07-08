use crate::error::Result;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};

#[tauri::command]
pub fn undo<R: tauri::Runtime>(
  single: Option<bool>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let pattern = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let mut history = history.write().unwrap();
  if single.unwrap_or(false) {
    if let Some(action) = history.get_mut(&pattern_id).undo() {
      action.revoke(&window, pattern)?;
    }
  } else if let Some(actions) = history.get_mut(&pattern_id).undo_transaction() {
    for action in actions.iter() {
      action.revoke(&window, pattern)?;
    }
  }

  Ok(())
}

#[tauri::command]
pub fn redo<R: tauri::Runtime>(
  single: Option<bool>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let pattern = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let mut history = history.write().unwrap();
  if single.unwrap_or(false) {
    if let Some(action) = history.get_mut(&pattern_id).redo() {
      action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;
    }
  } else if let Some(actions) = history.get_mut(&pattern_id).redo_transaction() {
    for action in actions.iter() {
      action.perform(&window, pattern)?;
    }
  }

  Ok(())
}

#[tauri::command]
pub fn start_transaction<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  _window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).start_transaction();

  Ok(())
}

#[tauri::command]
pub fn end_transaction<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  _window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).end_transaction();

  Ok(())
}
