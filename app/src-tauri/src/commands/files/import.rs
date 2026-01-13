use crate::error::{Error, ErrorKind, Result};
use crate::sidecars::{ImageImportSidecar, SidecarController as _, SidecarId, SidecarManager};
use crate::state::{HistoryState, PatternsState};

#[tracing::instrument(level = "trace", ret)]
#[tauri::command]
pub fn get_image_dimensions(image_path: std::path::PathBuf) -> Result<(u32, u32)> {
  Ok(image::image_dimensions(image_path)?)
}

/// Starts the image import sidecar in the "server" mode.
/// Returns the ID of the sidecar.
#[tracing::instrument(level = "trace", ret, skip_all)]
#[tauri::command]
pub async fn start_image_import_server<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  sidecar_manager: tauri::State<'_, SidecarManager>,
) -> Result<SidecarId> {
  let mut sidecar = ImageImportSidecar::new(app_handle);
  let id = sidecar.spawn().await?;

  sidecar_manager.insert(id, Box::new(sidecar)).await;

  Ok(id)
}

/// Stops the running image import sidecar by its ID.
#[tracing::instrument(level = "trace", skip(sidecar_manager))]
#[tauri::command]
pub async fn stop_image_import_server(id: SidecarId, sidecar_manager: tauri::State<'_, SidecarManager>) -> Result<()> {
  if let Some(sidecar) = sidecar_manager.remove(id).await {
    let mut sidecar = sidecar.lock().await;
    sidecar.shutdown().await?;
  }
  Ok(())
}

/// Sends updated parameters to the specified image import sidecar.
/// Returns the pattern imported from the image.
#[tracing::instrument(level = "trace", skip(sidecar_manager))]
#[tauri::command]
pub async fn get_image_import_preview(
  id: SidecarId,
  image_path: std::path::PathBuf,
  palette_path: std::path::PathBuf,
  options: embroiderly_image::ImageImportOptions,
  sidecar_manager: tauri::State<'_, SidecarManager>,
) -> Result<tauri::ipc::Response> {
  let Some(sidecar) = sidecar_manager.get(id).await else {
    return Err(Error::new(ErrorKind::FailedToImport).with_source(anyhow::anyhow!("Sidecar not found")));
  };

  let output = {
    let command = embroiderly_image::ImageImportServerCommand::Update {
      image_path,
      palette_path,
      options,
    };
    let payload = serde_json::to_vec(&command).map_err(|e| {
      Error::new(ErrorKind::FailedToImport).with_source(anyhow::anyhow!("Failed to serialize command: {e}"))
    })?;

    let mut sidecar = sidecar.lock().await;
    sidecar.send_command(payload).await?;
    sidecar.get_response().await?
  };

  Ok(tauri::ipc::Response::new(output))
}

/// Fetches the final image import result, stores it in app state, and stops the sidecar.
/// Returns the ID of the pattern imported from the image.
#[expect(clippy::too_many_arguments)]
#[tracing::instrument(level = "trace", skip(_app_handle, history, patterns, sidecar_manager))]
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
) -> Result<String> {
  let Some(sidecar) = sidecar_manager.remove(id).await else {
    return Err(Error::new(ErrorKind::FailedToImport).with_source(anyhow::anyhow!("Sidecar not found")));
  };
  let mut sidecar = sidecar.lock().await;

  let output = {
    let command = embroiderly_image::ImageImportServerCommand::Update {
      image_path,
      palette_path,
      options,
    };
    let payload = serde_json::to_vec(&command).map_err(|e| {
      Error::new(ErrorKind::FailedToImport).with_source(anyhow::anyhow!("Failed to serialize command: {e}"))
    })?;

    sidecar.send_command(payload).await?;
    sidecar.get_response().await?
  };
  let patproj: embroiderly_pattern::PatternProject = borsh::from_slice(&output)?;

  let pattern_id = patproj.id;

  history.write().unwrap().create(patproj.id);
  patterns.write().unwrap().add_pattern(patproj);

  sidecar.shutdown().await?;

  Ok(pattern_id.to_string())
}
