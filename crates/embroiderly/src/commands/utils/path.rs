use crate::error::Result;
use crate::utils::path::app_document_dir;

#[tauri::command]
pub fn get_app_document_dir<R: tauri::Runtime>(app_handle: tauri::AppHandle<R>) -> Result<String> {
  Ok(app_document_dir(&app_handle)?.to_string_lossy().to_string())
}
