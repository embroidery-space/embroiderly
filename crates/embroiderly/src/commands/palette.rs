use embroiderly_pattern::{PaletteItem, PaletteSettings};

use crate::core::actions::{
  Action as _, AddPaletteItemAction, RemovePaletteItemsAction, UpdatePaletteDisplaySettingsAction,
};
use crate::error::Result;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};

#[tauri::command]
pub fn add_palette_item<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, palette_item) = parse_command_payload!(request, PaletteItem);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();
  if !patproj.pattern.palette.contains(&palette_item) {
    let action = AddPaletteItemAction::new(palette_item);
    action.perform(&window, patproj)?;

    let mut history = history.write().unwrap();
    history.get_mut(&pattern_id).push(Box::new(action));
  }

  Ok(())
}

#[tauri::command]
pub fn remove_palette_items<R: tauri::Runtime>(
  palette_item_indexes: Vec<u32>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let action = RemovePaletteItemsAction::new(palette_item_indexes);
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  Ok(())
}

#[tauri::command]
pub fn update_palette_display_settings<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, palette_settings) = parse_command_payload!(request, PaletteSettings);

  let mut patterns = patterns.write().unwrap();
  let action = UpdatePaletteDisplaySettingsAction::new(palette_settings);
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  Ok(())
}
