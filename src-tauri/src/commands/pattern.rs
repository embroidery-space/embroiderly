use tauri::Emitter as _;

use crate::core::actions::{Action as _, CheckpointAction, UpdatePatternInfoAction};
use crate::core::parsers::{self, PatternFormat};
use crate::core::pattern::{Fabric, Pattern, PatternInfo, PatternProject};
use crate::error::{CommandError, PatternError, Result};
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};
use crate::utils::path::{app_document_dir, backup_file_path};

#[tauri::command]
pub fn load_pattern(pattern_id: uuid::Uuid, patterns: tauri::State<PatternsState>) -> Result<tauri::ipc::Response> {
  log::debug!("Loading Pattern({pattern_id:?})");

  let patterns = patterns.read().unwrap();
  if let Some(pattern) = patterns.get_pattern_by_id(&pattern_id) {
    log::debug!("Pattern({pattern_id:?}) loaded");
    Ok(tauri::ipc::Response::new(borsh::to_vec(&pattern)?))
  } else {
    log::error!("Pattern({pattern_id:?}) not found");
    Err(PatternError::PatternNotFound(pattern_id).into())
  }
}

#[tauri::command]
pub fn open_pattern(
  file_path: std::path::PathBuf,
  restore_from_backup: Option<bool>,
  patterns: tauri::State<PatternsState>,
) -> Result<tauri::ipc::Response> {
  log::debug!("Opening pattern");

  let mut patterns = patterns.write().unwrap();
  if let Some(pattern) = patterns.get_pattern_by_path(&file_path) {
    log::debug!("Pattern({:?}) already opened", pattern.id);
    return Ok(tauri::ipc::Response::new(borsh::to_vec(&pattern)?));
  }

  let backup_file_path = backup_file_path(&file_path, "bak");
  if backup_file_path.exists() {
    match restore_from_backup {
      Some(true) => {
        let pattern = parsers::parse_pattern(backup_file_path)?;
        log::debug!("Pattern({:?}) restored from backup", pattern.id);

        let result = borsh::to_vec(&pattern)?;
        patterns.add_pattern(pattern);

        return Ok(tauri::ipc::Response::new(result));
      }
      Some(false) => {}
      None => return Err(PatternError::BackupFileExists.into()),
    };
  }

  let new_file_path = file_path.with_extension(PatternFormat::default().to_string());
  let mut pattern = parsers::parse_pattern(file_path)?;
  pattern.file_path = new_file_path;
  log::debug!("Pattern({:?}) opened", pattern.id);

  let result = borsh::to_vec(&pattern)?;
  patterns.add_pattern(pattern);

  Ok(tauri::ipc::Response::new(result))
}

#[tauri::command]
pub fn create_pattern<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  app_handle: tauri::AppHandle<R>,
  patterns: tauri::State<PatternsState>,
) -> Result<tauri::ipc::Response> {
  if let tauri::ipc::InvokeBody::Raw(data) = request.body() {
    log::debug!("Creating new pattern");

    let fabric: Fabric = borsh::from_slice(data)?;
    let pattern = Pattern::new(fabric);
    let file_path = app_document_dir(&app_handle)?.join(format!("{}.{}", pattern.info.title, PatternFormat::default()));

    let patproj = PatternProject::new(file_path, pattern, Default::default());
    log::debug!("Pattern({:?}) created", patproj.id);

    let result = borsh::to_vec(&patproj)?;

    let mut patterns = patterns.write().unwrap();
    patterns.add_pattern(patproj);

    Ok(tauri::ipc::Response::new(result))
  } else {
    Err(CommandError::InvalidRequestBody.into())
  }
}

#[tauri::command]
pub fn save_pattern<R: tauri::Runtime>(
  pattern_id: uuid::Uuid,
  file_path: std::path::PathBuf,
  app_handle: tauri::AppHandle<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  log::debug!("Saving Pattern({pattern_id:?})");

  let mut patterns = patterns.write().unwrap();

  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();
  let previous_file_path = patproj.file_path.clone();

  // If the file is saved in a different format (e.g. oxs), we just write it down.
  // Else, we will also back it up.
  if PatternFormat::try_from(file_path.extension())? != PatternFormat::default() {
    patproj.file_path = file_path.clone();
    parsers::save_pattern(patproj, app_handle.package_info(), None)?;
    patproj.file_path = previous_file_path;
  } else {
    let new_file_path = backup_file_path(&file_path, "new");
    let backup_file_path = backup_file_path(&file_path, "bak");

    log::trace!("Saving the pattern to a temporary file.");
    patproj.file_path = new_file_path.clone();
    parsers::save_pattern(patproj, app_handle.package_info(), None)?;

    log::trace!("Backing up the previous file.");
    if previous_file_path.exists() {
      std::fs::rename(&previous_file_path, &backup_file_path)?;
    }

    log::trace!("Renaming the new file to the target file name.");
    std::fs::rename(&new_file_path, &file_path)?;
    patproj.file_path = file_path;
  }

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(CheckpointAction));

  app_handle.emit("app:pattern-saved", &pattern_id)?;
  log::debug!("Pattern saved {pattern_id:?}");
  Ok(())
}

#[tauri::command]
pub fn save_all_patterns<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  log::debug!("Saving all patterns");

  let _patterns = patterns
    .read()
    .unwrap()
    .patterns()
    .map(|p| (p.id, p.file_path.clone()))
    .collect::<Vec<_>>();
  for (pattern_id, file_path) in _patterns {
    save_pattern(
      pattern_id,
      file_path,
      app_handle.clone(),
      history.clone(),
      patterns.clone(),
    )?;
  }

  log::debug!("All patterns saved");
  Ok(())
}

#[tauri::command]
pub fn close_pattern<R: tauri::Runtime>(
  pattern_id: uuid::Uuid,
  force: Option<bool>,
  // This argument is required to resolve a strange type error.
  _window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  log::debug!("Closing Pattern({pattern_id:?})");

  if !force.unwrap_or(false) {
    let history = history.read().unwrap();
    if let Some(history) = history.get(&pattern_id) {
      if history.has_unsaved_changes() {
        return Err(PatternError::UnsavedChanges(pattern_id).into());
      }
    }
  }

  let patproj = patterns.write().unwrap().remove_pattern(&pattern_id).unwrap();

  let backup_file_path = backup_file_path(&patproj.file_path, "bak");
  if backup_file_path.exists() {
    std::fs::remove_file(backup_file_path)?;
  }

  log::debug!("Pattern({pattern_id:?}) closed");
  Ok(())
}

#[tauri::command]
pub fn close_all_patterns<R: tauri::Runtime>(
  // This argument is required to resolve a strange type error.
  _window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  log::debug!("Closing all patterns");

  let _patterns = patterns.read().unwrap().patterns().map(|p| p.id).collect::<Vec<_>>();
  for pattern_id in _patterns {
    close_pattern(
      pattern_id,
      Some(true),
      _window.clone(),
      history.clone(),
      patterns.clone(),
    )?;
  }

  log::debug!("All patterns closed");
  Ok(())
}

#[tauri::command]
pub fn get_unsaved_patterns<R: tauri::Runtime>(
  // This argument is required to resolve a strange type error.
  _window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
) -> Vec<uuid::Uuid> {
  log::debug!("Getting unsaved patterns");

  let history = history.read().unwrap();
  history
    .iter()
    .filter_map(|(pattern_id, history)| {
      if history.has_unsaved_changes() {
        Some(*pattern_id)
      } else {
        None
      }
    })
    .collect()
}

#[tauri::command]
pub fn get_pattern_file_path(pattern_id: uuid::Uuid, patterns: tauri::State<PatternsState>) -> String {
  let patterns = patterns.read().unwrap();
  let patproj = patterns.get_pattern_by_id(&pattern_id).unwrap();
  patproj.file_path.to_string_lossy().to_string()
}

#[tauri::command]
pub fn update_pattern_info<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, pattern_info) = parse_command_payload!(request, PatternInfo);

  let mut patterns = patterns.write().unwrap();
  let action = UpdatePatternInfoAction::new(pattern_info);
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  Ok(())
}
