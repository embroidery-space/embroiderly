use std::path::{Path, PathBuf};

use embroiderly_pattern::{BrandPaletteItem, PaletteItem, PaletteSettings};
use rayon::prelude::*;
use tauri::Manager as _;
use tauri_plugin_posthog::PostHogExt as _;

use crate::core::actions::{
  Action as _, AddPaletteItemAction, RemovePaletteItemsAction, UpdatePaletteDisplaySettingsAction,
};
use crate::error::Result;
use crate::parse_command_payload;
use crate::state::{HistoryState, PatternsState};
use crate::utils::palette::is_palette_file;
use crate::utils::path::app_data_dir;
use crate::vendor::telemetry::AppEvent;

#[tauri::command]
pub fn add_palette_item<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, palitem) = parse_command_payload!(request, PaletteItem);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();
  if !patproj.pattern.palette.contains(&palitem) {
    let event = AppEvent::PaletteItemAdded {
      brand: palitem.brand.clone(),
      is_blend: palitem.is_blend(),
      blends_number: palitem.blends.as_ref().map(|blends| blends.len()),
    };

    let action = AddPaletteItemAction::new(palitem);
    action.perform(&window, patproj)?;

    let mut history = history.write().unwrap();
    history.get_mut(&pattern_id).push(Box::new(action));

    app_handle.capture_event(event);
  }

  Ok(())
}

#[tauri::command]
pub fn remove_palette_items<R: tauri::Runtime>(
  palette_item_indexes: Vec<u32>,
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id,) = parse_command_payload!(request);

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut_pattern_by_id(&pattern_id).unwrap();

  let events = palette_item_indexes
    .clone()
    .into_iter()
    .filter_map(|palindex| {
      patproj
        .pattern
        .palette
        .get(palindex as usize)
        .map(|palitem| AppEvent::PaletteItemRemoved {
          brand: palitem.brand.clone(),
          is_blend: palitem.is_blend(),
          blends_number: palitem.blends.as_ref().map(|blends| blends.len()),
        })
    })
    .collect();

  let action = RemovePaletteItemsAction::new(palette_item_indexes);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  app_handle.capture_batch(events);

  Ok(())
}

#[tauri::command]
pub fn update_palette_display_settings<R: tauri::Runtime>(
  app_handle: tauri::AppHandle<R>,
  request: tauri::ipc::Request<'_>,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> Result<()> {
  let (pattern_id, settings) = parse_command_payload!(request, PaletteSettings);

  let mut patterns = patterns.write().unwrap();
  let action = UpdatePaletteDisplaySettingsAction::new(settings);
  action.perform(&window, patterns.get_mut_pattern_by_id(&pattern_id).unwrap())?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_id).push(Box::new(action));

  app_handle.capture_event(AppEvent::PaletteDisplaySettingsUpdated { settings });

  Ok(())
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportPaletteFilesResponse {
  pub failed_files: Vec<String>,
}

#[tauri::command]
pub fn import_palettes<R: tauri::Runtime>(
  paths: Vec<String>,
  app_handle: tauri::AppHandle<R>,
) -> Result<ImportPaletteFilesResponse> {
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
          .filter_map(|entry| entry.ok())
          .filter(|entry| entry.file_type().is_file() && is_palette_file(entry.path()))
          .map(|entry| entry.path().to_path_buf()),
      );
    }
  }

  // Parse and save palettes in parallel.
  let failed_files = palette_files
    .into_par_iter()
    .filter_map(|file_path| match parse_and_save_palette(&file_path, &palettes_dir) {
      Ok(_) => None,
      Err(_) => Some(file_path.to_string_lossy().to_string()),
    })
    .collect();

  Ok(ImportPaletteFilesResponse { failed_files })
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

#[derive(serde::Serialize)]
pub struct PalettesListResponse {
  pub system: Vec<String>,
  pub custom: Vec<String>,
}

#[tauri::command]
pub fn get_palettes_list<R: tauri::Runtime>(app_handle: tauri::AppHandle<R>) -> Result<PalettesListResponse> {
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

  Ok(PalettesListResponse { system, custom })
}

#[derive(serde::Deserialize)]
pub enum PaletteGroup {
  #[serde(rename = "system")]
  System,
  #[serde(rename = "custom")]
  Custom,
}

#[tauri::command]
pub fn load_palette<R: tauri::Runtime>(
  palette_group: PaletteGroup,
  palette_name: String,
  app_handle: tauri::AppHandle<R>,
) -> Result<Vec<u8>> {
  let palette_path = match palette_group {
    PaletteGroup::System => app_handle.path().resolve(
      format!("resources/palettes/{}.json", palette_name),
      tauri::path::BaseDirectory::Resource,
    )?,
    PaletteGroup::Custom => app_data_dir(&app_handle)?
      .join("palettes")
      .join(format!("{}.json", palette_name)),
  };
  let palette: Vec<BrandPaletteItem> = {
    let content = std::fs::read_to_string(palette_path)?;
    serde_json::from_str(&content).map_err(|e| anyhow::anyhow!("Failed to parse palette JSON: {}", e))?
  };
  Ok(borsh::to_vec(&palette)?)
}
