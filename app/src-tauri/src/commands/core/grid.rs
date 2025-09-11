use embroiderly_pattern::Grid;
use tauri_plugin_posthog::PostHogExt as _;

use crate::core::actions::{Action as _, UpdateGridPropertiesAction};
use crate::error::Result;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};
use crate::telemetry::AppEvent;

#[tauri::command]
pub fn update_grid<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, grid) = parse_command_payload!(request, Grid);

  let mut patterns = patterns.write().unwrap();
  let action = UpdateGridPropertiesAction::new(grid.clone());
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  app_handle.capture_event(AppEvent::GridUpdated { grid });

  Ok(())
}
