use embroiderly_pattern::{Fabric, FabricColor};
use tauri::Manager as _;
use tauri_plugin_posthog::PostHogExt as _;

use crate::core::actions::{Action as _, UpdateFabricPropertiesAction};
use crate::error::Result;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};
use crate::vendor::telemetry::AppEvent;

#[tauri::command]
pub fn update_fabric<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, fabric) = parse_command_payload!(request, Fabric);

  let mut patterns = patterns.write().unwrap();
  let action = UpdateFabricPropertiesAction::new(fabric.clone());
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  app_handle.capture_event(AppEvent::FabricUpdated { fabric });

  Ok(())
}

#[tauri::command]
pub fn load_fabric_colors<R: tauri::Runtime>(app_handle: tauri::AppHandle<R>) -> Result<Vec<u8>> {
  let fabric_colors_path = app_handle
    .path()
    .resolve("resources/fabric-colors.json", tauri::path::BaseDirectory::Resource)?;
  let fabric_colors: Vec<FabricColor> = {
    let content = std::fs::read_to_string(fabric_colors_path)?;
    serde_json::from_str(&content).map_err(|e| anyhow::anyhow!("Failed to parse fabric colors JSON: {}", e))?
  };
  Ok(borsh::to_vec(&fabric_colors)?)
}
