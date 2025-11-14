use std::path::{Path, PathBuf};

use embroiderly_pattern::BrandPaletteItem;
use rayon::prelude::*;
use tauri::Manager as _;
use tauri_plugin_posthog::PostHogExt as _;

use super::{FileGroup, GroupedFilesList, ImportFilesResponse};
use crate::error::Result;
use crate::utils::palette::is_palette_file;
use crate::utils::path::app_data_dir;
use crate::vendor::telemetry::AppEvent;

#[tauri::command]
pub fn import_palettes<R: tauri::Runtime>(
  paths: Vec<String>,
  app_handle: tauri::AppHandle<R>,
) -> Result<ImportFilesResponse> {
  let palettes_dir = app_data_dir(&app_handle)?.join("palettes");

  // Ensure the palettes directory exists.
  std::fs::create_dir_all(&palettes_dir)?;

  // Collect all palette files from the provided paths.
  let mut palette_files = Vec::new();
  for entry in paths.into_iter().map(PathBuf::from) {
    if entry.is_file() {
      palette_files.push(entry);
    } else if entry.is_dir() {
      palette_files.extend(
        walkdir::WalkDir::new(entry)
          .into_iter()
          .filter_map(std::result::Result::ok)
          .filter(|entry| entry.file_type().is_file() && is_palette_file(entry.path()))
          .map(|entry| entry.path().to_path_buf()),
      );
    }
  }

  // Parse and save palettes in parallel.
  let total_files = palette_files.len();
  let failed_files: Vec<String> = palette_files
    .into_par_iter()
    .filter_map(|file_path| match parse_and_save_palette(&file_path, &palettes_dir) {
      Ok(()) => None,
      Err(_) => Some(file_path.to_string_lossy().to_string()),
    })
    .collect();

  app_handle.capture_event(AppEvent::PalettesImported {
    total_files,
    failed_files: failed_files.len(),
  });

  Ok(ImportFilesResponse { failed_files })
}

fn parse_and_save_palette(file_path: &Path, palettes_dir: &Path) -> anyhow::Result<()> {
  let extension = file_path
    .extension()
    .and_then(|ext| ext.to_str())
    .ok_or_else(|| anyhow::anyhow!("Invalid palette file extension"))?;

  // Parse palette based on file extension.
  let palette: Vec<BrandPaletteItem> = match extension.to_ascii_lowercase().as_str() {
    "master" | "user" => xsp_parsers::pmaker::parse_palette(file_path)
      .map_err(|e| anyhow::anyhow!("Failed to parse Pattern Maker palette: {e}"))?
      .into_iter()
      .map(BrandPaletteItem::from)
      .collect(),
    "threads" => xsp_parsers::ursa::parse_palette(file_path)
      .map_err(|e| anyhow::anyhow!("Failed to parse UrsaSoftware palette: {e}"))?
      .into_iter()
      .map(BrandPaletteItem::from)
      .collect(),
    "rng" => xsp_parsers::xspro::parse_palette(file_path)
      .map_err(|e| anyhow::anyhow!("Failed to parse XSPro Platinum palette: {e}"))?
      .into_iter()
      .map(BrandPaletteItem::from)
      .collect(),
    "json" => {
      let content = std::fs::read_to_string(file_path)?;
      serde_json::from_str::<Vec<BrandPaletteItem>>(&content)
        .map_err(|e| anyhow::anyhow!("Failed to parse JSON palette: {e}"))?
    }
    _ => return Err(anyhow::anyhow!("Unsupported palette file format")),
  };

  // Get palette name from file stem.
  let palette_name = file_path
    .file_stem()
    .and_then(|name| name.to_str())
    .ok_or_else(|| anyhow::anyhow!("Invalid palette file name"))?;

  // Check for name conflicts.
  let output_path = palettes_dir.join(format!("{palette_name}.json"));
  if output_path.exists() {
    return Err(anyhow::anyhow!(r#"Palette with name "{palette_name}" already exists"#));
  }

  // Save palette as JSON.
  let json_content = serde_json::to_string(&palette)?;
  std::fs::write(&output_path, json_content)?;

  Ok(())
}

#[tauri::command]
pub fn get_palettes_list<R: tauri::Runtime>(app_handle: tauri::AppHandle<R>) -> Result<GroupedFilesList> {
  let mut system = Vec::new();
  let mut custom = Vec::new();

  // Get system palettes from resources.
  let resource_path = app_handle
    .path()
    .resolve("resources/palettes", tauri::path::BaseDirectory::Resource)?;
  if let Ok(entries) = std::fs::read_dir(resource_path) {
    for entry in entries.flatten() {
      if let Some(name) = entry.path().file_stem() {
        system.push(name.to_string_lossy().to_string());
      }
    }
  }

  // Get custom palettes from app data directory.
  let palettes_dir = app_data_dir(&app_handle)?.join("palettes");
  if let Ok(entries) = std::fs::read_dir(palettes_dir) {
    for entry in entries.flatten() {
      if let Some(name) = entry.path().file_stem() {
        custom.push(name.to_string_lossy().to_string());
      }
    }
  }

  system.sort();
  custom.sort();

  Ok(GroupedFilesList { system, custom })
}

#[tauri::command]
pub fn load_palette<R: tauri::Runtime>(
  palette_group: FileGroup,
  palette_name: String,
  app_handle: tauri::AppHandle<R>,
) -> Result<Vec<u8>> {
  let palette = load_palette_inner(palette_group, palette_name, app_handle)?;
  Ok(borsh::to_vec(&palette)?)
}

fn load_palette_inner<R: tauri::Runtime>(
  palette_group: FileGroup,
  palette_name: String,
  app_handle: tauri::AppHandle<R>,
) -> Result<Vec<BrandPaletteItem>> {
  let palette_path = resolve_palette_path_inner(palette_group, palette_name, app_handle)?;
  let palette_content = std::fs::read_to_string(palette_path)?;
  Ok(serde_json::from_str(&palette_content).map_err(|e| anyhow::anyhow!("Failed to parse palette JSON: {e}"))?)
}

#[tauri::command]
pub fn get_palette_size<R: tauri::Runtime>(
  palette_group: FileGroup,
  palette_name: String,
  app_handle: tauri::AppHandle<R>,
) -> Result<usize> {
  let palette = load_palette_inner(palette_group, palette_name, app_handle)?;
  Ok(palette.len())
}

#[tauri::command]
pub fn resolve_palette_path<R: tauri::Runtime>(
  palette_group: FileGroup,
  palette_name: String,
  app_handle: tauri::AppHandle<R>,
) -> Result<PathBuf> {
  resolve_palette_path_inner(palette_group, palette_name, app_handle)
}

fn resolve_palette_path_inner<R: tauri::Runtime>(
  palette_group: FileGroup,
  palette_name: String,
  app_handle: tauri::AppHandle<R>,
) -> Result<PathBuf> {
  let palette_path = match palette_group {
    FileGroup::System => app_handle.path().resolve(
      format!("resources/palettes/{palette_name}.json"),
      tauri::path::BaseDirectory::Resource,
    )?,
    FileGroup::Custom => app_data_dir(&app_handle)?
      .join("palettes")
      .join(format!("{palette_name}.json")),
  };
  Ok(palette_path)
}
