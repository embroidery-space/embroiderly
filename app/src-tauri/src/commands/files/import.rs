use crate::error::{PatternError, Result};
use crate::sidecars::ImageImportSidecar;
use crate::state::{HistoryState, ImageImportSidecarState, PatternsState};

#[tauri::command]
pub fn get_image_dimensions(image_path: std::path::PathBuf) -> Result<(u32, u32)> {
  Ok(image::image_dimensions(image_path)?)
}

#[tauri::command]
pub async fn get_pattern_from_image<R: tauri::Runtime>(
  image_path: std::path::PathBuf,
  palette_path: std::path::PathBuf,
  options: embroiderly_image::ImageImportOptions,
  app_handle: tauri::AppHandle<R>,
  sidecar_state: tauri::State<'_, ImageImportSidecarState<R>>,
) -> Result<tauri::ipc::Response> {
  log::debug!("Converting image into pattern");

  let mut sidecar = sidecar_state.lock().await;
  let sidecar = if let Some(sidecar) = sidecar.as_mut() {
    sidecar
  } else {
    sidecar.insert(ImageImportSidecar::new(app_handle, image_path.clone()).await?)
  };

  let output = sidecar.get_pattern(image_path, palette_path, options).await?;

  log::debug!("Image converted into pattern");
  Ok(tauri::ipc::Response::new(output))
}

#[tauri::command]
pub async fn finalize_image_import<R: tauri::Runtime>(
  image_path: std::path::PathBuf,
  palette_path: std::path::PathBuf,
  options: embroiderly_image::ImageImportOptions,
  history: tauri::State<'_, HistoryState<R>>,
  patterns: tauri::State<'_, PatternsState>,
  sidecar_state: tauri::State<'_, ImageImportSidecarState<R>>,
) -> Result<tauri::ipc::Response> {
  log::debug!("Finalizing image import");

  let mut sidecar = {
    let mut sidecar = sidecar_state.lock().await;
    sidecar.take().ok_or_else(|| {
      PatternError::FailedToExport(anyhow::anyhow!(
        "Image import sidecar is not running. Nothing to finalize."
      ))
    })?
  };

  let output = sidecar.get_pattern(image_path, palette_path, options).await?;
  sidecar.shutdown().await?;

  let patproj: embroiderly_pattern::PatternProject = borsh::from_slice(&output)?;

  history.write().unwrap().create(patproj.id);
  patterns.write().unwrap().add_pattern(patproj);

  log::debug!("Image import finalized successfully");
  Ok(tauri::ipc::Response::new(output))
}
