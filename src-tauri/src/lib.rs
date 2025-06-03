use std::sync::RwLock;

use state::{HistoryStateInner, PatternsState};
use tauri::Manager as _;

pub mod commands;
pub mod state;

mod core;
pub use core::pattern::*;

mod error;
mod logger;
mod utils;

pub fn setup_app<R: tauri::Runtime>(mut builder: tauri::Builder<R>) -> tauri::App<R> {
  builder = builder
    .setup(|app| {
      let app_handle = app.handle();

      create_webview_window(app_handle)?;

      #[cfg(not(debug_assertions))]
      copy_sample_patterns(app_handle)?;

      run_auto_save_background_process(app_handle);

      Ok(())
    })
    .manage(RwLock::new(core::pattern_manager::PatternManager::new()))
    .manage(RwLock::new(HistoryStateInner::<R>::new()))
    .plugin(logger::init());

  #[cfg(not(feature = "test"))]
  {
    // We do not need these plugins in tests, so we only add them in non-test builds.

    #[cfg(debug_assertions)]
    {
      use tauri_plugin_prevent_default::Flags;
      builder = builder.plugin(
        tauri_plugin_prevent_default::Builder::new()
          .with_flags(Flags::all().difference(Flags::DEV_TOOLS | Flags::RELOAD))
          .build(),
      );
    }

    #[cfg(not(debug_assertions))]
    {
      use tauri_plugin_prevent_default::Flags;
      builder = builder.plugin(
        tauri_plugin_prevent_default::Builder::new()
          .with_flags(Flags::all().difference(Flags::RELOAD))
          .build(),
      );
    }

    builder = builder
      .plugin(tauri_plugin_dialog::init())
      .plugin(tauri_plugin_fs::init())
      .plugin(tauri_plugin_opener::init())
      .plugin(
        tauri_plugin_pinia::Builder::new()
          .save_denylist(["embroiderly-patterns", "embroiderly-state"])
          .sync_denylist(["embroiderly-patterns", "embroiderly-state"])
          .build(),
      );
  }

  builder = builder.invoke_handler(tauri::generate_handler![
    commands::path::get_app_document_dir,
    commands::pattern::load_pattern,
    commands::pattern::open_pattern,
    commands::pattern::create_pattern,
    commands::pattern::save_pattern,
    commands::pattern::close_pattern,
    commands::pattern::get_pattern_file_path,
    commands::pattern::update_pattern_info,
    commands::display::set_display_mode,
    commands::display::show_symbols,
    commands::fabric::update_fabric,
    commands::grid::update_grid,
    commands::palette::add_palette_item,
    commands::palette::remove_palette_items,
    commands::palette::update_palette_display_settings,
    commands::stitches::add_stitch,
    commands::stitches::remove_stitch,
    commands::history::undo,
    commands::history::redo,
    commands::fonts::load_stitch_font,
  ]);

  builder
    .build(tauri::generate_context!())
    .expect("Failed to build Embroiderly")
}

fn create_webview_window<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> anyhow::Result<tauri::WebviewWindow<R>> {
  let webview_window = {
    #[allow(unused_mut)]
    let mut webview_window_builder = tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::default())
      .title(app.package_info().name.clone())
      .min_inner_size(640.0, 480.0)
      .maximized(true)
      .decorations(false)
      .additional_browser_args("--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection,ElasticOverscroll");

    // We enable browser extensions only for development.
    #[cfg(all(debug_assertions, target_os = "windows"))]
    {
      // Enable and setup browser extensions for development.
      webview_window_builder = webview_window_builder
        .browser_extensions_enabled(true)
        // Load the browser extensions from the `src-tauri/extensions/` directory.
        .extensions_path(std::env::current_dir()?.join("extensions"));
    }

    webview_window_builder.build()?
  };

  #[cfg(debug_assertions)]
  webview_window.open_devtools();

  Ok(webview_window)
}

#[allow(dead_code)]
fn copy_sample_patterns(app_handle: &tauri::AppHandle) -> anyhow::Result<()> {
  let app_document_dir = utils::path::app_document_dir(app_handle)?;
  if !app_document_dir.exists() {
    // Create the Embroiderly directory in the user's document directory
    // and copy the sample patterns there if it doesn't exist.
    log::debug!("Creating an app document directory",);
    std::fs::create_dir(&app_document_dir)?;
    log::debug!("Copying sample patterns to the app document directory");
    let patterns_path = app_handle
      .path()
      .resolve("resources/patterns/", tauri::path::BaseDirectory::Resource)?;
    for pattern in std::fs::read_dir(patterns_path)? {
      let pattern = pattern?.path();
      std::fs::copy(pattern.clone(), app_document_dir.join(pattern.file_name().unwrap()))?;
    }
  }
  Ok(())
}

fn run_auto_save_background_process<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) {
  use tauri_plugin_pinia::ManagerExt as _;

  let interval = app_handle
    .pinia()
    .get("embroiderly-settings", "other")
    .map(|v| {
      v.get("autoSaveInterval")
        .and_then(|v| serde_json::from_value(v.to_owned()).ok())
        .unwrap_or(0)
    })
    .unwrap()
    .clamp(0, 240);
  let interval = std::time::Duration::from_secs(interval * 60);

  if interval.is_zero() {
    log::debug!("Auto-save is disabled.");
    return;
  }

  let app_handle = app_handle.clone();
  std::thread::spawn(move || {
    loop {
      std::thread::sleep(interval);
      log::debug!("Auto-saving patterns...");

      let patterns = app_handle.state::<PatternsState>();
      let patterns = patterns
        .read()
        .unwrap()
        .patterns()
        .map(|p| (p.id, p.file_path.clone()))
        .collect::<Vec<_>>();
      for (pattern_id, file_path) in patterns {
        if let Err(err) = commands::pattern::save_pattern(
          pattern_id,
          file_path,
          app_handle.clone(),
          app_handle.state::<PatternsState>(),
        ) {
          log::error!("Failed to auto-save Pattern({:?}): {:?}", pattern_id, err);
        }
      }

      log::debug!("Auto-save completed.");
    }
  });
}
