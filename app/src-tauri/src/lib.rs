use std::sync::{Mutex, RwLock};

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
        startup::handle_file_associations(app_handle, urls.into_iter().map(|url| url.to_string()));
        startup::handle_open_on_startup(app_handle);
        startup::create_webview_window(app_handle).unwrap();
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
        startup::handle_file_associations(app_handle, std::env::args().skip(1));
        startup::handle_open_on_startup(app_handle);
        startup::create_webview_window(app_handle)?;
      }

      #[cfg(not(debug_assertions))]
      startup::copy_sample_patterns(app_handle)?;

      startup::run_auto_save_background_process(app_handle);

      Ok(())
    })
    .manage(RwLock::new(state::PatternManager::new()))
    .manage(RwLock::new(state::HistoryManager::<R>::new()))
    .manage(Mutex::new(state::StartupNotifications::new()))
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
    // Utility commands.
    commands::utils::path::get_app_document_dir,
    commands::utils::startup::get_startup_notifications,
  ]);

  builder
    .build(tauri::generate_context!())
    .expect("Failed to build Embroiderly")
}
