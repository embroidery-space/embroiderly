use embroiderly_pattern::{DisplayMode, LayersVisibility};
use tauri_plugin_posthog::PostHogExt;

use crate::core::actions::{Action as _, SetDisplayModeAction, SetLayersVisibilityAction, ShowSymbolsAction};
use crate::error::Result;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};
use crate::vendor::telemetry::AppEvent;

#[tauri::command]
pub fn set_display_mode<R: tauri::Runtime>(
  mode: String,
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);
  let mode = mode.parse::<DisplayMode>().map_err(|e| anyhow::anyhow!(e))?;

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = SetDisplayModeAction::new(mode);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  app_handle.capture_event(AppEvent::DisplayModeChanged { mode });

  Ok(())
}

#[tauri::command]
pub fn show_symbols<R: tauri::Runtime>(
  value: bool,
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = ShowSymbolsAction::new(value);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  app_handle.capture_event(AppEvent::SymbolsVisibilityChanged { visible: value });

  Ok(())
}

#[tauri::command]
pub fn set_layers_visibility<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, visibility) = parse_command_payload!(request, LayersVisibility);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = SetLayersVisibilityAction::new(visibility);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  app_handle.capture_event(AppEvent::LayersVisibilityChanged { visibility });

  Ok(())
}
