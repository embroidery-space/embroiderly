use embroiderly_pattern::{PaletteItem, PaletteSettings};
use tauri_plugin_posthog::PostHogExt as _;

use crate::core::actions::{
  Action as _, AddPaletteItemAction, RemovePaletteItemsAction, ReorderPaletteItemsAction, SetSymbolAction,
  SetSymbolData, SortPaletteAction, SortPaletteBy, UpdatePaletteDisplaySettingsAction,
};
use crate::error::Result;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};
use crate::vendor::telemetry::AppEvent;

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
      blends_number: palitem.blends.as_ref().map(Vec::len),
    };

    let action = AddPaletteItemAction::new(palitem);
    action.perform(&window, patproj)?;

    let mut history = history.write().unwrap();
    history.get_mut(&pattern_id).unwrap().push(Box::new(action));

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
        .get(palindex)
        .map(|palitem| AppEvent::PaletteItemRemoved {
          brand: palitem.brand.clone(),
          is_blend: palitem.is_blend(),
          blends_number: palitem.blends.as_ref().map(Vec::len),
        })
    })
    .collect();

  let action = RemovePaletteItemsAction::new(palette_item_indexes);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

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
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  // Only update if settings have actually changed.
  if patproj.display_settings.palette_settings == settings {
    return Ok(());
  };

  let action = UpdatePaletteDisplaySettingsAction::new(settings);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  app_handle.capture_event(AppEvent::PaletteDisplaySettingsUpdated { settings });

  Ok(())
}

#[tauri::command]
pub fn sort_palette_by<R: tauri::Runtime>(
  sort_by: SortPaletteBy,
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = SortPaletteAction::new(sort_by);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  app_handle.capture_event(AppEvent::PaletteSorted {
    sort_by,
    palette_size: patproj.pattern.palette.len(),
    blends_number: patproj.pattern.palette.blends_number(),
    used_palette_brands: patproj.pattern.palette.used_brands(),
  });

  Ok(())
}

#[tauri::command]
pub fn reorder_palette_items<R: tauri::Runtime>(
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

  let action = ReorderPaletteItemsAction::new(old_position, new_position);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  Ok(())
}

#[tauri::command]
pub fn set_symbol<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, SetSymbolData { palindex, symbol }) = parse_command_payload!(request, SetSymbolData);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = SetSymbolAction::new(palindex, symbol);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  Ok(())
}
