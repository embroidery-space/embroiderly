use crate::core::actions::{
  Action as _, AddLayerAction, LayerVisibility, MoveLayerAction, RemoveLayerAction, RenameLayerAction,
  UpdateLayerVisibilityAction,
};
use crate::error::{Error, ErrorKind, Result};
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};

#[tracing::instrument(level = "trace", skip_all, fields(pattern_id), err)]
#[tauri::command]
pub fn add_layer<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = AddLayerAction::new();
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

#[tracing::instrument(level = "trace", skip_all, fields(pattern_id, ?layer_index), err)]
#[tauri::command]
pub fn rename_layer<R: tauri::Runtime>(
  layer_index: u32,
  name: String,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = RenameLayerAction::new(layer_index, name);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  Ok(())
}

#[tracing::instrument(level = "trace", skip_all, fields(pattern_id, ?layer_index), err)]
#[tauri::command]
pub fn update_layer_visibility<R: tauri::Runtime>(
  layer_index: u32,
  visibility: LayerVisibility,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = UpdateLayerVisibilityAction::new(layer_index, visibility);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  Ok(())
}

#[tracing::instrument(level = "trace", skip_all, fields(pattern_id, ?old_position, ?new_position), err)]
#[tauri::command]
pub fn move_layer<R: tauri::Runtime>(
  old_position: u32,
  new_position: u32,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = MoveLayerAction::new(old_position, new_position);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  Ok(())
}
