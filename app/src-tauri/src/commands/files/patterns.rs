use embroiderly_parsers::PatternFormat;
use embroiderly_pattern::{Fabric, Pattern, PatternProject, ReferenceImage};
use tauri::Emitter as _;
use tauri_plugin_posthog::PostHogExt as _;

use crate::core::actions::CheckpointAction;
use crate::error::{CommandError, PatternError, Result};
use crate::state::{HistoryState, PatternsState};
use crate::utils::path::{app_document_dir, backup_file_path};
use crate::vendor::telemetry::AppEvent;

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
pub fn open_pattern<R: tauri::Runtime>(
  file_path: std::path::PathBuf,
  restore_from_backup: Option<bool>,
  app_handle: tauri::AppHandle<R>,
  history: tauri::State<HistoryState<R>>,
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

        let response = tauri::ipc::Response::new(borsh::to_vec(&pattern)?);

        history.write().unwrap().create(pattern.id);
        patterns.add_pattern(pattern);

        return Ok(response);
      }
      Some(false) => {}
      None => return Err(PatternError::BackupFileExists.into()),
    }
  }

  let mut patproj = embroiderly_parsers::parse_pattern(file_path.clone())?;
  patproj.file_path = file_path.with_extension(PatternFormat::default().to_string());

  {
    let (full_stitches_number, petite_stitches_number) = patproj.pattern.full_stitches_number();
    let (half_stitches_number, quarter_stitches_number) = patproj.pattern.part_stitches_number();
    let (back_stitches_number, straight_stitches_number) = patproj.pattern.line_stitches_number();
    let (french_knots_number, beads_number) = patproj.pattern.node_stitches_number();
    let special_stitches_number = patproj.pattern.specialstitches.len();

    log::debug!("Pattern({:?}) opened", patproj.id);
    app_handle.capture_event(AppEvent::PatternOpened {
      format: PatternFormat::try_from(file_path.extension())
        .expect("After parsing, the pattern format is always valid"),
      fabric: patproj.pattern.fabric.clone(),

      palette_size: patproj.pattern.palette.len(),
      blends_number: patproj.pattern.palette.blends_number(),
      used_palette_brands: patproj.pattern.palette.used_brands(),
      used_stitch_fonts: patproj.pattern.palette.used_symbol_fonts(),

      full_stitches_number,
      petite_stitches_number,
      half_stitches_number,
      quarter_stitches_number,
      back_stitches_number,
      straight_stitches_number,
      french_knots_number,
      beads_number,
      special_stitches_number,

      has_reference_image: patproj.reference_image.is_some(),
      reference_image_format: patproj.reference_image.as_ref().map(|image| image.format),
      reference_image_dimensions: patproj.reference_image.as_ref().map(ReferenceImage::dimensions),
      reference_image_size: patproj.reference_image.as_ref().map(|image| image.content.len()),
    });
  }

  let response = tauri::ipc::Response::new(borsh::to_vec(&patproj)?);

  history.write().unwrap().create(patproj.id);
  patterns.add_pattern(patproj);

  Ok(response)
}

#[tauri::command]
pub fn create_pattern<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  app_handle: tauri::AppHandle<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<tauri::ipc::Response> {
  if let tauri::ipc::InvokeBody::Raw(data) = request.body() {
    log::debug!("Creating new pattern");

    let fabric: Fabric = borsh::from_slice(data)?;
    let pattern = Pattern::new(fabric);
    let file_path = app_document_dir(&app_handle)?.join(format!("{}.{}", pattern.info.title, PatternFormat::default()));

    let patproj = PatternProject::new(file_path, pattern, Default::default(), Default::default());

    log::debug!("Pattern({:?}) created", patproj.id);
    app_handle.capture_event(AppEvent::PatternCreated {
      fabric: patproj.pattern.fabric.clone(),
    });

    let response = tauri::ipc::Response::new(borsh::to_vec(&patproj)?);

    history.write().unwrap().create(patproj.id);
    patterns.write().unwrap().add_pattern(patproj);

    Ok(response)
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

  let format = PatternFormat::try_from(file_path.extension())?;
  if format == PatternFormat::default() {
    let new_file_path = backup_file_path(&file_path, "new");
    let backup_file_path = backup_file_path(&file_path, "bak");

    log::trace!("Saving the pattern to a temporary file.");
    patproj.file_path.clone_from(&new_file_path);
    embroiderly_parsers::save_pattern(patproj, &package_info, None)?;

    log::trace!("Backing up the previous file.");
    if previous_file_path.exists() {
      std::fs::rename(&previous_file_path, &backup_file_path)?;
    }

    log::trace!("Renaming the new file to the target file name.");
    std::fs::rename(&new_file_path, &file_path)?;
    patproj.file_path = file_path;
  } else {
    patproj.file_path.clone_from(&file_path);
    embroiderly_parsers::save_pattern(patproj, &package_info, None)?;
    patproj.file_path = previous_file_path;
  }

  log::debug!("Pattern saved {pattern_id:?}");
  app_handle.capture_event(AppEvent::PatternSaved { format });

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).unwrap().push(Box::new(CheckpointAction));

  app_handle.emit("app:pattern-saved", &pattern_id)?;
  Ok(())
}

#[tauri::command]
pub fn save_all_patterns<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  log::debug!("Saving all patterns");

  let patterns_to_save = patterns
    .read()
    .unwrap()
    .patterns()
    .map(|p| (p.id, p.file_path.clone()))
    .collect::<Vec<_>>();
  for (pattern_id, file_path) in patterns_to_save {
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
  app_handle: tauri::AppHandle<R>,
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
  app_handle.capture_event(AppEvent::PatternClosed);

  Ok(())
}

#[tauri::command]
pub fn close_all_patterns<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  log::debug!("Closing all patterns");

  let patterns_to_close = patterns.read().unwrap().patterns().map(|p| p.id).collect::<Vec<_>>();
  for pattern_id in patterns_to_close {
    close_pattern(
      pattern_id,
      Some(true),
      app_handle.clone(),
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
#[must_use]
pub fn get_opened_patterns(patterns: tauri::State<PatternsState>) -> Vec<(String, String)> {
  log::debug!("Getting opened patterns");

  let patterns = patterns.read().unwrap();
  patterns
    .patterns()
    .map(|patproj| (patproj.id.to_string(), patproj.pattern.info.title.clone()))
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
#[must_use]
pub fn get_pattern_file_path(pattern_id: uuid::Uuid, patterns: tauri::State<PatternsState>) -> String {
  let patterns = patterns.read().unwrap();
  let patproj = patterns.get_pattern_by_id(&pattern_id).unwrap();
  patproj.file_path.to_string_lossy().to_string()
}
