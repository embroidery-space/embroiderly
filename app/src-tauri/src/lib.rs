use std::sync::RwLock;

use tauri::Manager as _;

pub mod commands;
mod core;
mod error;
mod plugins;
pub mod services;
mod sidecars;
mod startup;
pub mod state;
mod utils;

pub use core::actions::{StitchPayload, StitchesEvent};

/// Runs the application.
pub fn run() {
  setup_app(tauri::Builder::default()).run(|app_handle, event| {
    match event {
      // Yeah, we don't currently support MacOS, but keep the code for future use.
      #[cfg(any(target_os = "macos", target_os = "ios"))]
      tauri::RunEvent::Opened { urls } => {
        let files = urls.into_iter().filter_map(|url| url.to_file_path().ok()).collect();
        startup::create_webview_window(app_handle, files).unwrap();
      }
      tauri::RunEvent::Exit => {
        // Shutdown all running sidecars gracefully.
        let sidecar_manager = app_handle.state::<sidecars::SidecarManager>();
        tauri::async_runtime::block_on(async {
          let sidecars = sidecar_manager.extract_all().await;
          for sidecar in sidecars {
            let mut sidecar = sidecar.lock().await;
            let _ = sidecar.shutdown().await;
          }
        });
      }
      _ => {}
    }
  });
}

/// Sets up the application for running or testing.
fn setup_app<R: tauri::Runtime>(mut builder: tauri::Builder<R>) -> tauri::App<R> {
  builder = builder
    .setup(|app| {
      let app_handle = app.handle();

      services::logger::init(app_handle)?;

      #[cfg(any(target_os = "windows", target_os = "linux"))]
      {
        let files = collect_files_from_args(std::env::args().skip(1));
        create_webview_window(app_handle, files)?;
      }

      startup::run_auto_save_background_process(app_handle);

      Ok(())
    })
    .manage(RwLock::new(state::PatternManager::new()))
    .manage(RwLock::new(state::HistoryManager::<R>::new()))
    .manage(sidecars::SidecarManager::new());

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
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_pinia::init());

  builder = builder.invoke_handler(tauri::generate_handler![
    // Pattern files management.
    commands::files::patterns::load_pattern,
    commands::files::patterns::open_pattern,
    commands::files::patterns::create_pattern,
    commands::files::patterns::save_pattern,
    commands::files::patterns::close_pattern,
    commands::files::patterns::get_opened_patterns,
    commands::files::patterns::get_unsaved_patterns,
    commands::files::patterns::get_pattern_file_path,
    commands::files::patterns::get_pattern_default_file_path,
    // Palette files management.
    commands::files::palettes::import_palettes,
    commands::files::palettes::get_palettes_list,
    commands::files::palettes::load_palette,
    commands::files::palettes::resolve_palette_path,
    // Symbol font files management.
    commands::files::fonts::get_symbol_fonts_list,
    commands::files::fonts::load_symbol_font_content,
    commands::files::fonts::load_symbol_font_code_points,
    commands::files::fonts::import_symbol_fonts,
    // Importing images into patterns.
    commands::files::import::get_image_dimensions,
    commands::files::import::start_image_import_server,
    commands::files::import::stop_image_import_server,
    commands::files::import::get_image_import_preview,
    commands::files::import::finalize_image_import,
    // Exporting patterns into PDF documents.
    commands::files::export::export_pattern,
    // Core commands (patterns edititng).
    commands::core::pattern::update_pattern_info,
    commands::core::image::set_reference_image,
    commands::core::image::remove_reference_image,
    commands::core::image::update_reference_image_settings,
    commands::core::display::update_display_settings,
    commands::core::fabric::update_fabric,
    commands::core::fabric::load_fabric_colors,
    commands::core::grid::update_grid,
    commands::core::palette::add_palette_item,
    commands::core::palette::remove_palette_items,
    commands::core::palette::update_palette_display_settings,
    commands::core::palette::sort_palette_by,
    commands::core::palette::reorder_palette_items,
    commands::core::palette::set_symbol,
    commands::core::layers::add_layer,
    commands::core::layers::remove_layer,
    commands::core::layers::rename_layer,
    commands::core::layers::update_layer_visibility,
    commands::core::layers::move_layer,
    commands::core::stitches::add_stitch,
    commands::core::stitches::remove_stitch,
    commands::core::publish::update_pdf_export_options,
    commands::core::history::undo,
    commands::core::history::redo,
    commands::core::history::start_transaction,
    commands::core::history::end_transaction,
  ]);

  builder
    .build(tauri::generate_context!())
    .expect("Failed to build Embroiderly")
}

/// Collects file paths from command line arguments.
/// Handles both plain paths and `file://` URLs; skips flags starting with `-`.
fn collect_files_from_args(args: impl IntoIterator<Item = String>) -> Vec<std::path::PathBuf> {
  let mut files = Vec::new();

  for maybe_file in args {
    if maybe_file.starts_with('-') {
      continue;
    }

    if maybe_file.starts_with("file://") {
      if let Ok(url) = tauri::Url::parse(&maybe_file)
        && let Ok(path) = url.to_file_path()
      {
        files.push(path);
      }
    } else {
      files.push(maybe_file.into());
    }
  }

  files
}

/// Creates the main webview window for the application.
/// Injects `window.openedFiles` with paths from file associations (may be empty).
fn create_webview_window<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  files: Vec<std::path::PathBuf>,
) -> anyhow::Result<tauri::WebviewWindow<R>> {
  let files_js = files
    .into_iter()
    .map(|f| {
      let path = f.to_string_lossy().replace('\\', "\\\\");
      format!("\"{path}\"")
    })
    .collect::<Vec<_>>()
    .join(",");

  let webview_window = tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::default())
    .title(app.package_info().name.clone())
    .min_inner_size(640.0, 480.0)
    .maximized(true)
    .decorations(false)
    .visible(cfg!(debug_assertions))
    .initialization_script(format!("window.openedFiles = [{files_js}]"))
    .build()?;

  #[cfg(debug_assertions)]
  // Skip opening devtools for automation testing.
  if std::env::var("TAURI_WEBVIEW_AUTOMATION").is_err() {
    webview_window.open_devtools();
  }

  Ok(webview_window)
}
