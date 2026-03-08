use embroiderly_pattern::DisplaySettings;
use tauri_plugin_better_posthog::PostHogExt as _;

use crate::core::actions::{Action as _, UpdateDisplaySettingsAction};
use crate::error::Result;
use crate::parse_command_payload;
use crate::services::telemetry::AppEvent;
use crate::state::{HistoryState, PatternsState};

#[tracing::instrument(level = "trace", skip_all, fields(pattern_id, body), err)]
#[tauri::command]
pub fn update_display_settings<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, display_settings) = parse_command_payload!(request, DisplaySettings);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = UpdateDisplaySettingsAction::new(display_settings.clone());
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  app_handle.capture_event(AppEvent::DisplaySettingsUpdated { display_settings });

  Ok(())
}
