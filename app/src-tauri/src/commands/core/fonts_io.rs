use std::path::{Path, PathBuf};

use rayon::prelude::*;
use tauri::Manager as _;
use tauri_plugin_posthog::PostHogExt as _;

use crate::error::Result;
use crate::utils::fonts::is_font_file;
use crate::utils::path::app_data_dir;
use crate::vendor::telemetry::AppEvent;

#[derive(serde::Serialize)]
pub struct SymbolFontsListResponse {
  pub system: Vec<String>,
  pub custom: Vec<String>,
}

#[tauri::command]
pub fn get_symbol_fonts_list<R: tauri::Runtime>(app_handle: tauri::AppHandle<R>) -> Result<SymbolFontsListResponse> {
  let mut system = Vec::new();
  let mut custom = Vec::new();

  // Get system fonts from resources.
  let resource_path = app_handle
    .path()
    .resolve("resources/fonts", tauri::path::BaseDirectory::Resource)?;
  if let Ok(entries) = std::fs::read_dir(resource_path) {
    for entry in entries.flatten() {
      if let Some(name) = entry.path().file_stem() {
        system.push(name.to_string_lossy().to_string());
      }
    }
  }

  // Get custom fonts from app data directory.
  let fonts_dir = app_data_dir(&app_handle)?.join("fonts");
  if let Ok(entries) = std::fs::read_dir(fonts_dir) {
    for entry in entries.flatten() {
      if let Some(name) = entry.path().file_stem() {
        custom.push(name.to_string_lossy().to_string());
      }
    }
  }

  system.sort();
  custom.sort();

  Ok(SymbolFontsListResponse { system, custom })
}

#[tauri::command]
pub fn load_symbol_font_content<R: tauri::Runtime>(
  font_family: String,
  app_handle: tauri::AppHandle<R>,
) -> Result<tauri::ipc::Response> {
  let font_data = load_symbol_font_data(&font_family, &app_handle)?;
  Ok(tauri::ipc::Response::new(font_data))
}

fn load_symbol_font_data<R: tauri::Runtime>(font_family: &str, app_handle: &tauri::AppHandle<R>) -> Result<Vec<u8>> {
  // Try to load from resources directory first.
  let font_data = app_handle
    .path()
    .resolve(
      format!("resources/fonts/{font_family}.ttf"),
      tauri::path::BaseDirectory::Resource,
    )
    .ok()
    .and_then(|path| std::fs::read(path).ok());

  // Try to load from app data directory if not found.
  let font_data = if font_data.is_none() {
    app_data_dir(app_handle)
      .ok()
      .and_then(|dir| std::fs::read(dir.join("fonts").join(format!("{font_family}.ttf"))).ok())
  } else {
    font_data
  };

  // Fallback to system registry if still not found.
  let font_data = if font_data.is_none() {
    let source = font_kit::source::SystemSource::new();
    let handle = source
      .select_family_by_name(font_family)
      .ok()
      .and_then(|handle| handle.fonts().first().cloned());
    match handle {
      Some(font_kit::handle::Handle::Path { path, .. }) => std::fs::read(path).ok(),
      Some(font_kit::handle::Handle::Memory { bytes, .. }) => Some((**bytes).to_vec()),
      None => None,
    }
  } else {
    font_data
  };

  font_data.ok_or_else(|| {
    anyhow::anyhow!("Font '{font_family}' is not found in resources, app data, or system registry").into()
  })
}

#[tauri::command]
pub fn load_symbol_font_code_points<R: tauri::Runtime>(
  font_family: String,
  app_handle: tauri::AppHandle<R>,
) -> Result<Vec<u32>> {
  let font_data = load_symbol_font_data(&font_family, &app_handle)?;
  let font_face = ttf_parser::Face::parse(&font_data, 0).map_err(|e| anyhow::anyhow!("Failed to parse font: {e}"))?;

  let glyph_count = font_face.number_of_glyphs();

  let mut code_points = std::collections::HashSet::new();
  for subtable in font_face.tables().cmap.into_iter().flat_map(|cmap| cmap.subtables) {
    if matches!(
      subtable.format,
      ttf_parser::cmap::Format::SegmentMappingToDeltaValues(..)
    ) {
      subtable.codepoints(|codepoint| {
        if let Some(glyph_id) = subtable.glyph_index(codepoint) {
          let glyph_index = glyph_id.0;
          if glyph_index != 0 && glyph_index < glyph_count && matches!(codepoint, 0x0021..=0xD7FF | 0xE000..=0xFFFD) {
            code_points.insert(codepoint);
          }
        }
      });
    } else {
      break;
    }
  }

  let mut code_points: Vec<u32> = code_points.into_iter().collect();
  code_points.sort_unstable();

  Ok(code_points)
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportSymbolFontsResponse {
  pub failed_files: Vec<String>,
}

#[tauri::command]
pub fn import_symbol_fonts<R: tauri::Runtime>(
  paths: Vec<String>,
  app_handle: tauri::AppHandle<R>,
) -> Result<ImportSymbolFontsResponse> {
  let fonts_dir = app_data_dir(&app_handle)?.join("fonts");

  // Ensure the fonts directory exists.
  std::fs::create_dir_all(&fonts_dir)?;

  // Collect all font files from the provided paths.
  let mut font_files = Vec::new();
  for entry in paths.into_iter().map(PathBuf::from) {
    if entry.is_file() {
      if is_font_file(&entry) {
        font_files.push(entry);
      }
    } else if entry.is_dir() {
      font_files.extend(
        walkdir::WalkDir::new(entry)
          .into_iter()
          .filter_map(|entry| entry.ok())
          .filter(|entry| entry.file_type().is_file() && is_font_file(entry.path()))
          .map(|entry| entry.path().to_path_buf()),
      );
    }
  }

  // Process and save fonts in parallel.
  let total_files = font_files.len();
  let failed_files: Vec<String> = font_files
    .into_par_iter()
    .filter_map(|file_path| match process_and_save_font(&file_path, &fonts_dir) {
      Ok(_) => None,
      Err(_) => Some(file_path.to_string_lossy().to_string()),
    })
    .collect();

  app_handle.capture_event(AppEvent::SymbolFontsImported {
    total_files,
    failed_files: failed_files.len(),
  });

  Ok(ImportSymbolFontsResponse { failed_files })
}

fn process_and_save_font(file_path: &Path, fonts_dir: &Path) -> anyhow::Result<()> {
  let font_data = std::fs::read(file_path)?;
  let font_face = ttf_parser::Face::parse(&font_data, 0).map_err(|e| anyhow::anyhow!("Failed to parse font: {e}"))?;

  // Extract font family name.
  let font_family = font_face
    .names()
    .into_iter()
    .find(|name| name.name_id == ttf_parser::name_id::FAMILY)
    .and_then(|name| name.to_string())
    .ok_or_else(|| anyhow::anyhow!("Font does not have a family name"))?;

  // Check for name conflicts.
  let extension = file_path
    .extension()
    .and_then(|ext| ext.to_str())
    .ok_or_else(|| anyhow::anyhow!("Invalid font file extension"))?;
  let output_path = fonts_dir.join(format!("{font_family}.{extension}"));
  if output_path.exists() {
    return Err(anyhow::anyhow!(
      r#"Font with family name "{font_family}" already exists"#
    ));
  }

  // Copy font file to fonts directory.
  std::fs::copy(file_path, output_path)?;

  Ok(())
}
