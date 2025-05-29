use crate::core::actions::{Action as _, UpdateGridPropertiesAction};
use crate::error::CommandResult;
use crate::state::{HistoryState, PatternsState};

#[tauri::command]
pub fn update_grid<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  if let tauri::ipc::InvokeBody::Raw(data) = request.body() {
    let pattern_key = request.headers().get("patternKey").unwrap().to_str().unwrap().into();
    let grid = borsh::from_slice(data)?;

    let mut patterns = patterns.write().unwrap();
    let action = UpdateGridPropertiesAction::new(grid);
    action.perform(&window, patterns.get_mut(&pattern_key).unwrap())?;

    let mut history = history.write().unwrap();
    history.get_mut(&pattern_key).push(Box::new(action));

    Ok(())
  } else {
    Err(anyhow::anyhow!("Invalid request body").into())
  }
}
