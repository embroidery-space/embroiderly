use crate::core::parsers::{self, PatternFormat};
use crate::core::pattern::{Fabric, Pattern, PatternProject};
use crate::error::CommandResult;
use crate::state::PatternsState;
use crate::utils::path::app_document_dir;

#[tauri::command]
pub fn load_pattern(id: uuid::Uuid, patterns: tauri::State<PatternsState>) -> CommandResult<tauri::ipc::Response> {
  log::debug!("Loading Pattern({id:?})");

  let patterns = patterns.read().unwrap();
  if let Some(pattern) = patterns.get_pattern_by_id(&id) {
    log::debug!("Pattern({id:?}) loaded");
    Ok(tauri::ipc::Response::new(borsh::to_vec(&pattern)?))
  } else {
    log::error!("Pattern({id:?}) not found");
    Err(anyhow::anyhow!("Pattern not found").into())
  }
}

#[tauri::command]
pub fn open_pattern(
  file_path: std::path::PathBuf,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<tauri::ipc::Response> {
  log::debug!("Opening pattern");

  let mut patterns = patterns.write().unwrap();
  if let Some(pattern) = patterns.get_pattern_by_path(&file_path) {
    log::debug!("Pattern({:?}) already opened", pattern.id);
    return Ok(tauri::ipc::Response::new(borsh::to_vec(&pattern)?));
  }

  let pattern = match PatternFormat::try_from(file_path.extension())? {
    PatternFormat::Xsd => parsers::xsd::parse_pattern(file_path)?,
    PatternFormat::Oxs => parsers::oxs::parse_pattern(file_path)?,
    PatternFormat::EmbProj => parsers::embproj::parse_pattern(file_path)?,
  };

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
) -> CommandResult<tauri::ipc::Response> {
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
    Err(anyhow::anyhow!("Invalid request body").into())
  }
}

#[tauri::command]
pub fn save_pattern<R: tauri::Runtime>(
  id: uuid::Uuid,
  file_path: std::path::PathBuf,
  app_handle: tauri::AppHandle<R>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  log::debug!("Saving Pattern({id:?})");

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&id).unwrap();
  patproj.file_path = file_path;
  match PatternFormat::try_from(patproj.file_path.extension())? {
    PatternFormat::Xsd => Err(anyhow::anyhow!("The XSD format is not supported for saving.")),
    PatternFormat::Oxs => parsers::oxs::save_pattern(patproj, app_handle.package_info()),
    PatternFormat::EmbProj => parsers::embproj::save_pattern(patproj, app_handle.package_info()),
  }?;

  log::debug!("Pattern saved {id:?}");
  Ok(())
}

#[tauri::command]
pub fn close_pattern(id: uuid::Uuid, patterns: tauri::State<PatternsState>) {
  log::debug!("Closing Pattern({id:?})");
  patterns.write().unwrap().remove_pattern(&id);
  log::debug!("Pattern({id:?}) closed");
}

#[tauri::command]
pub fn get_pattern_file_path(id: uuid::Uuid, patterns: tauri::State<PatternsState>) -> String {
  let patterns = patterns.read().unwrap();
  let patproj = patterns.get_pattern_by_id(&id).unwrap();
  patproj.file_path.to_string_lossy().to_string()
}
