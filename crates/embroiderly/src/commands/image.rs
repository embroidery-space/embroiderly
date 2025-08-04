use embroiderly_pattern::{ReferenceImage, ReferenceImageSettings};

use crate::core::actions::{Action as _, SetReferenceImageAction, UpdateReferenceImageSettingsAction};
use crate::error::Result;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};

#[tauri::command]
pub fn set_reference_image<R: tauri::Runtime>(
  file_path: std::path::PathBuf,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  patterns: tauri::State<PatternsState>,
  history: tauri::State<HistoryState<R>>,
) -> Result<()> {
  log::debug!("Setting a reference image");
  let (pattern_id,) = parse_command_payload!(request);

  let image = ReferenceImage::new(std::fs::read(file_path)?, None);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = SetReferenceImageAction::new(image);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  log::debug!("Reference image set successfully");
  Ok(())
}

#[tauri::command]
pub fn update_reference_image_settings<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, settings) = parse_command_payload!(request, ReferenceImageSettings);

  let mut patterns = patterns.write().unwrap();
  let action = UpdateReferenceImageSettingsAction::new(settings);
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  Ok(())
}
