use embroiderly_pattern::{PaletteItem, PaletteSettings};
use tauri_plugin_posthog::PostHogExt;

use crate::core::actions::{
  Action as _, AddPaletteItemAction, RemovePaletteItemsAction, UpdatePaletteDisplaySettingsAction,
};
use crate::error::Result;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};
use crate::telemetry::AppEvent;

#[tauri::command]
pub fn add_palette_item<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, palitem) = parse_command_payload!(request, PaletteItem);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();
  if !patproj.pattern.palette.contains(&palitem) {
    let event = AppEvent::PaletteItemAdded {
      brand: palitem.brand.clone(),
      is_blend: palitem.is_blend(),
      blends_number: palitem.blends.as_ref().map(|blends| blends.len()),
    };

    let action = AddPaletteItemAction::new(palitem);
    action.perform(&window, patproj)?;

    let mut history = history.write().unwrap();
    history.get_mut(&pattern_id).push(Box::new(action));

    app_handle.capture_event(event);
  }

  Ok(())
}

#[tauri::command]
pub fn remove_palette_items<R: tauri::Runtime>(
  palette_item_indexes: Vec<u32>,
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let events = palette_item_indexes
    .clone()
    .into_iter()
    .filter_map(|palindex| {
      patproj
        .pattern
        .palette
        .get(palindex as usize)
        .map(|palitem| AppEvent::PaletteItemRemoved {
          brand: palitem.brand.clone(),
          is_blend: palitem.is_blend(),
          blends_number: palitem.blends.as_ref().map(|blends| blends.len()),
        })
    })
    .collect();

  let action = RemovePaletteItemsAction::new(palette_item_indexes);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  app_handle.capture_batch(events);

  Ok(())
}

#[tauri::command]
pub fn update_palette_display_settings<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, settings) = parse_command_payload!(request, PaletteSettings);

  let mut patterns = patterns.write().unwrap();
  let action = UpdatePaletteDisplaySettingsAction::new(settings);
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  app_handle.capture_event(AppEvent::PaletteDisplaySettingsUpdated { settings });

  Ok(())
}
