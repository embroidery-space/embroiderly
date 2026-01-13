use embroiderly_pattern::{Fabric, FabricColor};
use tauri_plugin_better_posthog::PostHogExt as _;

use crate::core::actions::{Action as _, UpdateFabricPropertiesAction};
use crate::error::Result;
use crate::parse_command_payload;
use crate::services::telemetry::AppEvent;
use crate::state::{HistoryState, PatternsState};

#[tracing::instrument(level = "trace", skip_all, fields(pattern_id, body), err)]
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
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  app_handle.capture_event(AppEvent::FabricUpdated { fabric });

  Ok(())
}

#[tracing::instrument(level = "trace", err)]
#[tauri::command]
pub fn load_fabric_colors() -> Result<tauri::ipc::Response> {
  let fabric_colors_path = crate::utils::path::resolve_app_resources("resources/fabric-colors.json")?;
  let fabric_colors: Vec<FabricColor> = {
    let content = std::fs::read_to_string(fabric_colors_path)?;
    serde_json::from_str(&content).map_err(|e| anyhow::anyhow!("Failed to parse fabric colors JSON: {e}"))?
  };
  Ok(tauri::ipc::Response::new(borsh::to_vec(&fabric_colors)?))
}
