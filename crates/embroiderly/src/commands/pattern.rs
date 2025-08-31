use embroiderly_parsers::PatternFormat;
use embroiderly_pattern::{Fabric, Pattern, PatternInfo, PatternProject};
use tauri::Emitter as _;

use crate::core::actions::{Action as _, CheckpointAction, UpdatePatternInfoAction};
use crate::error::{CommandError, PatternError, Result};
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};
use crate::utils::path::{app_document_dir, app_logs_dir, backup_file_path};

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
        let pattern = embroiderly_parsers::parse_pattern(backup_file_path)?;
        log::debug!("Pattern({:?}) restored from backup", pattern.id);

        let result = borsh::to_vec(&pattern)?;
        patterns.add_pattern(pattern);

        return Ok(tauri::ipc::Response::new(result));
      }
      Some(false) => {}
      None => return Err(PatternError::BackupFileExists.into()),
    };
  }

  let mut pattern = embroiderly_parsers::parse_pattern(file_path.clone())?;
  pattern.file_path = file_path.with_extension(PatternFormat::default().to_string());
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

    let patproj = PatternProject::new(file_path, pattern, Default::default(), Default::default());
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

  let package_info = {
    let package_info = app_handle.package_info();
    embroiderly_parsers::PackageInfo {
      name: package_info.name.clone(),
      version: package_info.version.to_string(),
    }
  };

  // If the file is saved in a different format (e.g. oxs), we just write it down.
  // Else, we will also back it up.
  if PatternFormat::try_from(file_path.extension())? != PatternFormat::default() {
    patproj.file_path = file_path.clone();
    embroiderly_parsers::save_pattern(patproj, &package_info, None)?;
    patproj.file_path = previous_file_path;
  } else {
    let new_file_path = backup_file_path(&file_path, "new");
    let backup_file_path = backup_file_path(&file_path, "bak");

    log::trace!("Saving the pattern to a temporary file.");
    patproj.file_path = new_file_path.clone();
    embroiderly_parsers::save_pattern(patproj, &package_info, None)?;

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
pub fn export_pattern<R: tauri::Runtime>(
  pattern_id: uuid::Uuid,
  file_path: std::path::PathBuf,
  options: serde_json::Value,
  app_handle: tauri::AppHandle<R>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  use tauri_plugin_shell::ShellExt;

  log::debug!("Exporting Pattern({pattern_id:?})");

  let package_info = {
    let package_info = app_handle.package_info();
    embroiderly_parsers::PackageInfo {
      name: package_info.name.clone(),
      version: package_info.version.to_string(),
    }
  };

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  // Create a temporary file to not conflict with the existing file.
  let tempfile_path = tempfile::NamedTempFile::new()?
    .path()
    .with_extension(PatternFormat::default().to_string());
  let previous_file_path = patproj.file_path.clone();
  patproj.file_path = tempfile_path.to_path_buf().clone();
  embroiderly_parsers::save_pattern(patproj, &package_info, None)?;
  patproj.file_path = previous_file_path;

  let logs_dir = app_logs_dir(&app_handle)?;

  let sidecar = app_handle
    .shell()
    .sidecar("embroiderly-publish")
    .map_err(|e| PatternError::FailedToExport(e.into()))?;
  let output = tauri::async_runtime::block_on(async move {
    let mut sidecar = sidecar
      .env(embroiderly_logger::EMBROIDERLY_LOG_DIR_ENV_VAR, logs_dir)
      .arg("--pattern")
      .arg(&tempfile_path)
      .arg("--output")
      .arg(&file_path);

    if let Ok(options) = serde_json::to_string(&options) {
      sidecar = sidecar.arg("--options").arg(options);
    } else {
      log::error!("Failed to serialize options: {options:?}");
      return Err(PatternError::FailedToExport(anyhow::anyhow!(
        "Failed to serialize options"
      )));
    }

    let result = sidecar.output().await;

    if let Err(e) = std::fs::remove_file(tempfile_path) {
      log::error!("Failed to remove temporary file: {e}");
    }

    result.map_err(|e| PatternError::FailedToExport(e.into()))
  })?;

  if !output.status.success() {
    let stderr = String::from_utf8_lossy(&output.stderr);
    log::error!("Error while exporting pattern: {stderr}");
    return Err(
      PatternError::FailedToExport(anyhow::anyhow!(
        "Process terminated with exit code {:?}: {stderr}",
        output.status.code()
      ))
      .into(),
    );
  }
  app_handle.emit("app:pattern-exported", &pattern_id)?;

  log::debug!("Pattern({pattern_id:?}) exported");
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
    if let Some(history) = history.get(&pattern_id)
      && history.has_unsaved_changes()
    {
      return Err(PatternError::UnsavedChanges(pattern_id).into());
    }
  }

  let patproj = patterns.write().unwrap().remove_pattern(&pattern_id).unwrap();
  let _history = history.write().unwrap().remove(&pattern_id);

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

/// Returns a list of opened patterns with their IDs and titles.
/// This is used on the first app startup to initially load those patterns which were opened using file associations.
#[tauri::command]
pub fn get_opened_patterns(patterns: tauri::State<PatternsState>) -> Vec<(String, String)> {
  log::debug!("Getting opened patterns");

  let patterns = patterns.read().unwrap();
  patterns
    .patterns()
    .map(|patproj| (patproj.id.to_string(), patproj.pattern.info.title.to_string()))
    .collect()
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
