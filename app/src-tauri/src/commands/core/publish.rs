use embroiderly_pattern::PdfExportOptions;
use tauri_plugin_posthog::PostHogExt as _;

use crate::core::actions::{Action as _, UpdatePdfExportOptionsAction};
use crate::error::Result;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};
use crate::vendor::telemetry::AppEvent;

#[tauri::command]
pub fn update_pdf_export_options<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, settings) = parse_command_payload!(request, PdfExportOptions);

  let mut patterns = patterns.write().unwrap();
  let action = UpdatePdfExportOptionsAction::new(settings);
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  app_handle.capture_event(AppEvent::PdfExportSettingsUpdated { settings });

  Ok(())
}
