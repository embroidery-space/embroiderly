use crate::core::actions::{Action, AddStitchAction, RemoveStitchAction};
use crate::error::CommandResult;
use crate::state::{HistoryState, PatternsState};

#[tauri::command]
pub fn add_stitch<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  if let tauri::ipc::InvokeBody::Raw(data) = request.body() {
    let pattern_key = request.headers().get("patternKey").unwrap().to_str().unwrap().into();
    let stitch = borsh::from_slice(data)?;

    let mut patterns = patterns.write().unwrap();
    let patproj = patterns.get_mut(&pattern_key).unwrap();

    if !patproj.pattern.contains_stitch(&stitch) {
      let action = AddStitchAction::new(stitch);
      action.perform(&window, patproj)?;

      let mut history = history.write().unwrap();
      history.get_mut(&pattern_key).push(Box::new(action));
    }

    Ok(())
  } else {
    Err(anyhow::anyhow!("Invalid request body").into())
  }
}

#[tauri::command]
pub fn remove_stitch<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  if let tauri::ipc::InvokeBody::Raw(data) = request.body() {
    let pattern_key = request.headers().get("patternKey").unwrap().to_str().unwrap().into();
    let stitch = borsh::from_slice(data)?;

    let mut patterns = patterns.write().unwrap();
    let patproj = patterns.get_mut(&pattern_key).unwrap();

    // This command may accept the stitches which doesn't contain all the properties of the stitch.
    // So we need to get the actual stitch from the pattern.
    if let Some(target) = patproj.pattern.get_stitch(&stitch) {
      let action = RemoveStitchAction::new(target);
      action.perform(&window, patproj)?;

      let mut history = history.write().unwrap();
      history.get_mut(&pattern_key).push(Box::new(action));
    }

    Ok(())
  } else {
    Err(anyhow::anyhow!("Invalid request body").into())
  }
}
