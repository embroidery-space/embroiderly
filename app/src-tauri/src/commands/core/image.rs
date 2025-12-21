use embroiderly_pattern::{ReferenceImage, ReferenceImageSettings};
use tauri_plugin_better_posthog::PostHogExt as _;

use crate::core::actions::{Action as _, SetReferenceImageAction, UpdateReferenceImageSettingsAction};
use crate::error::Result;
use crate::parse_command_payload;
use crate::services::telemetry::AppEvent;
use crate::state::{HistoryState, PatternsState};

#[tracing::instrument(level = "trace", skip_all, fields(pattern_id, ?file_path))]
#[tauri::command]
pub fn set_reference_image<R: tauri::Runtime>(
  file_path: std::path::PathBuf,
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  patterns: tauri::State<PatternsState>,
  history: tauri::State<HistoryState<R>>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let image = ReferenceImage::new(std::fs::read(file_path)?, None);

  let event = AppEvent::ReferenceImageSet {
    format: image.format,
    dimensions: image.dimensions(),
    size: image.content.len(),
  };

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = SetReferenceImageAction::new(Some(image));
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  app_handle.capture_event(event);

  Ok(())
}

#[tracing::instrument(level = "trace", skip_all, fields(pattern_id))]
#[tauri::command]
pub fn remove_reference_image<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  patterns: tauri::State<PatternsState>,
  history: tauri::State<HistoryState<R>>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = SetReferenceImageAction::new(None);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(action));

  app_handle.capture_event(AppEvent::ReferenceImageRemoved);

  Ok(())
}

#[tracing::instrument(level = "trace", skip_all, fields(pattern_id, body))]
#[tauri::command]
pub fn update_reference_image_settings<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, settings) = parse_command_payload!(request, ReferenceImageSettings);

  let mut patterns = patterns.write().unwrap();
  let pattern = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  if pattern.reference_image.is_some() {
    let action = UpdateReferenceImageSettingsAction::new(settings);
    action.perform(&window, pattern)?;

    let mut history = history.write().unwrap();
    history.get_mut(&pattern_id).unwrap().push(Box::new(action));
  }

  app_handle.capture_event(AppEvent::ReferenceImageSettingsUpdated { settings });

  Ok(())
}
