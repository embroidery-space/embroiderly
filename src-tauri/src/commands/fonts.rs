use convert_case::{Case, Casing};
use tauri::Manager;

use crate::error::Result;

#[tauri::command]
pub fn load_stitch_font<R: tauri::Runtime>(
  font_family: String,
  app_handle: tauri::AppHandle<R>,
) -> Result<tauri::ipc::Response> {
  let font_family = font_family.to_case(Case::Snake);
  let font_path = app_handle.path().resolve(
    format!("resources/fonts/{font_family}.ttf"),
    tauri::path::BaseDirectory::Resource,
  )?;
  let content = std::fs::read(font_path)?;
  Ok(tauri::ipc::Response::new(content))
}
