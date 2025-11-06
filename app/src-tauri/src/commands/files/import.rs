use crate::error::Result;
use crate::sidecars::SidecarRunner;

#[tauri::command]
pub fn get_image_dimensions(image_path: std::path::PathBuf) -> Result<(u32, u32)> {
  Ok(image::image_dimensions(image_path)?)
}

#[tauri::command]
pub fn get_pattern_preview_from_image<R: tauri::Runtime>(
  image_path: std::path::PathBuf,
  palette_path: std::path::PathBuf,
  options: embroiderly_image::ImageImportOptions,
  app_handle: tauri::AppHandle<R>,
) -> Result<tauri::ipc::Response> {
  log::debug!("Creating pattern preview for image import");

  let output = crate::sidecars::ImageImportSidecar::new(app_handle.clone())
    .image_path(image_path)
    .palette_path(palette_path)
    .options(options)
    .run()?;

  log::debug!("Pattern preview created");
  Ok(tauri::ipc::Response::new(output.stdout))
}
