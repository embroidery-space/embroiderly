use std::sync::RwLock;

use state::HistoryStateInner;
use tauri::Manager as _;

pub mod commands;
pub mod state;

mod core;
pub use core::pattern::*;

mod error;
mod logger;
mod prevent_default;
mod utils;

pub fn setup_app<R: tauri::Runtime>(builder: tauri::Builder<R>) -> tauri::App<R> {
  builder
    .setup(|app| {
      #[cfg(any(target_os = "windows", target_os = "linux"))]
      {
        let mut files = Vec::new();

        // NOTICE: `args` may include URL protocol (`file://`) or arguments (`--`).
        for maybe_file in std::env::args().skip(1) {
          // skip flags like `-f` or `--flag`
          if maybe_file.starts_with('-') {
            continue;
          }

          if maybe_file.starts_with("file://") {
            if let Ok(url) = tauri::Url::parse(&maybe_file) {
              if let Ok(path) = url.to_file_path() {
                files.push(path);
              }
            }
          } else {
            files.push(maybe_file.into());
          }
        }

        handle_file_associations(app.handle(), files)?;
      }

      let app_document_dir = utils::path::app_document_dir(app.handle())?;
      if !cfg!(test) && !app_document_dir.exists() {
        // Create the Embroiderly directory in the user's document directory
        // and copy the sample patterns there if it doesn't exist.
        log::debug!("Creating an app document directory",);
        std::fs::create_dir(&app_document_dir)?;
        log::debug!("Copying sample patterns to the app document directory");
        let patterns_path = app
          .path()
          .resolve("resources/patterns/", tauri::path::BaseDirectory::Resource)?;
        for pattern in std::fs::read_dir(patterns_path)? {
          let pattern = pattern?.path();
          std::fs::copy(pattern.clone(), app_document_dir.join(pattern.file_name().unwrap()))?;
        }
      }

      Ok(())
    })
    .manage(RwLock::new(core::pattern_manager::PatternManager::new()))
    .manage(RwLock::new(HistoryStateInner::<R>::new()))
    .plugin(logger::init())
    .plugin(prevent_default::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
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
    ])
    .build(tauri::generate_context!())
    .expect("Failed to build Embroiderly")
}

pub fn handle_file_associations<R: tauri::Runtime>(
  app_handle: &tauri::AppHandle<R>,
  files: Vec<std::path::PathBuf>,
) -> anyhow::Result<tauri::WebviewWindow<R>> {
  let files = files
    .into_iter()
    .map(|file| {
      let file = file.to_string_lossy().replace('\\', "\\\\"); // escape backslash
      format!("\"{file}\"",) // wrap in quotes for JS array
    })
    .collect::<Vec<_>>()
    .join(",");
  let init_script = format!("window.openedFiles = [{files}]");

  create_webview_window(app_handle, Some(init_script))
}

fn create_webview_window<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  init_script: Option<String>,
) -> anyhow::Result<tauri::WebviewWindow<R>> {
  let webview_window = {
    #[allow(unused_mut)]
    let mut webview_window_builder = tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::default())
      .title(app.package_info().name.clone())
      .min_inner_size(640.0, 480.0)
      .maximized(true)
      .decorations(false)
      .additional_browser_args("--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection,ElasticOverscroll");

    if let Some(script) = init_script {
      webview_window_builder = webview_window_builder.initialization_script(script);
    }

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
