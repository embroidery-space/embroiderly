use crate::core::actions::{
  Action as _, AddPaletteItemAction, RemovePaletteItemsAction, UpdatePaletteDisplaySettingsAction,
};
use crate::error::CommandResult;
use crate::state::{HistoryState, PatternsState};

#[tauri::command]
pub fn add_palette_item<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  if let tauri::ipc::InvokeBody::Raw(data) = request.body() {
    let pattern_key = request.headers().get("patternKey").unwrap().to_str().unwrap().into();
    let palette_item = borsh::from_slice(data)?;

    let mut patterns = patterns.write().unwrap();
    let patproj = patterns.get_mut(&pattern_key).unwrap();
    if !patproj.pattern.palette.contains(&palette_item) {
      let action = AddPaletteItemAction::new(palette_item);
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
pub fn remove_palette_items<R: tauri::Runtime>(
  palette_item_indexes: Vec<u32>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  let pattern_key = request.headers().get("patternKey").unwrap().to_str().unwrap().into();

  let mut patterns = patterns.write().unwrap();
  let action = RemovePaletteItemsAction::new(palette_item_indexes);
  action.perform(&window, patterns.get_mut(&pattern_key).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_key).push(Box::new(action));

  Ok(())
}

#[tauri::command]
pub fn update_palette_display_settings<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  if let tauri::ipc::InvokeBody::Raw(data) = request.body() {
    let pattern_key = request.headers().get("patternKey").unwrap().to_str().unwrap().into();
    let palette_settings = borsh::from_slice(data)?;

    let mut patterns = patterns.write().unwrap();
    let action = UpdatePaletteDisplaySettingsAction::new(palette_settings);
    action.perform(&window, patterns.get_mut(&pattern_key).unwrap())?;

    let mut history = history.write().unwrap();
    history.get_mut(&pattern_key).push(Box::new(action));

    Ok(())
  } else {
    Err(anyhow::anyhow!("Invalid request body").into())
  }
}
