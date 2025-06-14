use crate::core::actions::{Action as _, AddStitchAction, RemoveStitchAction};
use crate::error::Result;
use crate::state::{HistoryState, PatternsState};
use crate::{Stitch, parse_command_payload};

#[tauri::command]
pub fn add_stitch<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, stitch) = parse_command_payload!(request, Stitch);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  if !patproj.pattern.contains_stitch(&stitch) {
    let action = AddStitchAction::new(stitch);
    action.perform(&window, patproj)?;

    let mut history = history.write().unwrap();
    history.get_mut(&pattern_id).push(Box::new(action));
  }

  Ok(())
}

#[tauri::command]
pub fn remove_stitch<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, stitch) = parse_command_payload!(request, Stitch);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  // This command may accept the stitches which doesn't contain all the properties of the stitch.
  // So we need to get the actual stitch from the pattern.
  if let Some(target) = patproj.pattern.get_stitch(&stitch) {
    let action = RemoveStitchAction::new(target);
    action.perform(&window, patproj)?;

    let mut history = history.write().unwrap();
    history.get_mut(&pattern_id).push(Box::new(action));
  }

  Ok(())
}
