use crate::core::actions::{Action as _, AddLayerAction, RemoveLayerAction};
use crate::error::{Error, ErrorKind, Result};
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};

#[tracing::instrument(level = "trace", skip_all, fields(pattern_id, ?name), err)]
#[tauri::command]
pub fn add_layer<R: tauri::Runtime>(
  name: String,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = AddLayerAction::new(name);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  Ok(())
}

#[tracing::instrument(level = "trace", skip_all, fields(pattern_id, ?layer_index), err)]
#[tauri::command]
pub fn remove_layer<R: tauri::Runtime>(
  layer_index: u32,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  if patproj.pattern.layers.len() <= 1 {
    return Err(Error::new(ErrorKind::CannotRemoveLastLayer));
  }

  let action = RemoveLayerAction::new(layer_index);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  Ok(())
}
