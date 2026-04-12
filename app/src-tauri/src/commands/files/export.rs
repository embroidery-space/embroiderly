use embroiderly_parsers::PatternFormat;
use embroiderly_pattern::PdfExportOptions;
use tauri::Emitter as _;

use crate::error::Result;
use crate::sidecars::SidecarRunner as _;
use crate::state::PatternsState;

#[tracing::instrument(level = "trace", skip(app_handle, patterns), err)]
#[tauri::command]
pub fn export_pattern<R: tauri::Runtime>(
  pattern_id: uuid::Uuid,
  file_path: std::path::PathBuf,
  options: PdfExportOptions,
  app_handle: tauri::AppHandle<R>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
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
  embroiderly_parsers::save_pattern(patproj, &tempfile_path, &package_info)?;

  crate::sidecars::PdfExportSidecar::new(app_handle.clone())
    .pattern_path(tempfile_path)
    .output_path(file_path)
    .options(options)
    .run()?;

  app_handle.emit("app:pattern-exported", &pattern_id)?;

  Ok(())
}
