use embroiderly_pattern::ReferenceImage;

use crate::core::actions::{Action as _, SetReferenceImageAction};
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

  let image_content = std::fs::read(file_path)?;
  let image = ReferenceImage {
    format: image::guess_format(&image_content)?,
    content: image_content,
  };

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let action = SetReferenceImageAction::new(image);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  log::debug!("Reference image set successfully");
  Ok(())
}
