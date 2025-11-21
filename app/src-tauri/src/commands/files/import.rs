use crate::error::{PatternError, Result};
use crate::sidecars::{ImageImportSidecar, SidecarController as _, SidecarId, SidecarManager};
use crate::state::{HistoryState, PatternsState};

#[tauri::command]
pub fn get_image_dimensions(image_path: std::path::PathBuf) -> Result<(u32, u32)> {
  Ok(image::image_dimensions(image_path)?)
}

/// Starts the image import sidecar in the "server" mode.
/// Returns the ID of the sidecar.
#[tauri::command]
pub async fn start_image_import_server<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  sidecar_manager: tauri::State<'_, SidecarManager>,
) -> Result<SidecarId> {
  log::debug!("Starting image import server");

  let mut sidecar = ImageImportSidecar::new(app_handle);
  let id = sidecar.spawn().await?;

  sidecar_manager.insert(id, Box::new(sidecar)).await;

  log::debug!("Image import server started");
  Ok(id)
}

/// Stops the running image import sidecar by its ID.
#[tauri::command]
pub async fn stop_image_import_server(id: SidecarId, sidecar_manager: tauri::State<'_, SidecarManager>) -> Result<()> {
  log::debug!("Stopping image import server");

  if let Some(sidecar) = sidecar_manager.remove(id).await {
    let mut sidecar = sidecar.lock().await;
    sidecar.shutdown().await?;
  }

  log::debug!("Image import server stopped");
  Ok(())
}

/// Sends updated parameters to the specified image import sidecar.
/// Returns the pattern imported from the image.
#[tauri::command]
pub async fn get_image_import_preview(
  id: SidecarId,
  image_path: std::path::PathBuf,
  palette_path: std::path::PathBuf,
  options: embroiderly_image::ImageImportOptions,
  sidecar_manager: tauri::State<'_, SidecarManager>,
) -> Result<tauri::ipc::Response> {
  log::debug!("Converting image into pattern");

  let Some(sidecar) = sidecar_manager.get(id).await else {
    return Err(PatternError::FailedToImport(anyhow::anyhow!("Sidecar not found")).into());
  };

  let output = {
    let payload = serde_json::json!({
      "imagePath": image_path,
      "palettePath": palette_path,
      "options": options,
    });
    let payload = serde_json::to_vec(&payload).unwrap();

    let mut sidecar = sidecar.lock().await;
    sidecar.send_message(payload).await?;
    sidecar.get_response().await?
  };

  log::debug!("Image converted into pattern");
  Ok(tauri::ipc::Response::new(output))
}

/// Fetches the final image import result, stores it in app state, and stops the sidecar.
/// Returns the pattern imported from the image.
#[expect(clippy::too_many_arguments)]
#[tauri::command]
pub async fn finalize_image_import<R: tauri::Runtime>(
  id: SidecarId,
  image_path: std::path::PathBuf,
  palette_path: std::path::PathBuf,
  options: embroiderly_image::ImageImportOptions,
  _app_handle: tauri::AppHandle<R>, // This fixes type inference error.
  history: tauri::State<'_, HistoryState<R>>,
  patterns: tauri::State<'_, PatternsState>,
  sidecar_manager: tauri::State<'_, SidecarManager>,
) -> Result<tauri::ipc::Response> {
  log::debug!("Finalizing image import");

  let Some(sidecar) = sidecar_manager.remove(id).await else {
    return Err(PatternError::FailedToImport(anyhow::anyhow!("Sidecar not found")).into());
  };
  let mut sidecar = sidecar.lock().await;

  let output = {
    let payload = serde_json::json!({
      "imagePath": image_path,
      "palettePath": palette_path,
      "options": options,
    });
    let payload = serde_json::to_vec(&payload).unwrap();

    sidecar.send_message(payload).await?;
    sidecar.get_response().await?
  };

  let patproj: embroiderly_pattern::PatternProject = borsh::from_slice(&output)?;
  history.write().unwrap().create(patproj.id);
  patterns.write().unwrap().add_pattern(patproj);

  sidecar.shutdown().await?;

  log::debug!("Image import finalized successfully");
  Ok(tauri::ipc::Response::new(output))
}
