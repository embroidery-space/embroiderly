use std::sync::RwLock;

use tauri_plugin_posthog::PostHogExt as _;

pub mod commands;
mod core;
mod error;
mod sidecars;
mod startup;
pub mod state;
mod utils;
pub mod vendor;

/// Runs the application.
pub fn run() {
  setup_app(tauri::Builder::default()).run(|app_handle, event| {
    match event {
      // Yeah, we don't currently support MacOS, but keep the code for future use.
      #[cfg(any(target_os = "macos", target_os = "ios"))]
      tauri::RunEvent::Opened { urls } => {
        startup::handle_file_associations(app_handle, urls.into_iter().map(|url| url.to_string())).unwrap();
        startup::create_webview_window(app_handle).unwrap();
      }
      tauri::RunEvent::Exit => app_handle.capture_event(vendor::telemetry::AppEvent::AppExited),
      _ => {}
    }
  });
}

/// Sets up the application for running or testing.
fn setup_app<R: tauri::Runtime>(mut builder: tauri::Builder<R>) -> tauri::App<R> {
  builder = builder
    .setup(|app| {
      let app_handle = app.handle();

      vendor::logger::init(app_handle)?;
      vendor::telemetry::init(app_handle)?;

      app_handle.capture_event(vendor::telemetry::AppEvent::AppStarted);

      #[cfg(any(target_os = "windows", target_os = "linux"))]
      {
        startup::handle_file_associations(app_handle, std::env::args().skip(1))?;
        startup::create_webview_window(app_handle)?;
      }

      #[cfg(not(debug_assertions))]
      startup::copy_sample_patterns(app_handle)?;

      startup::run_auto_save_background_process(app_handle);

      Ok(())
    })
    .manage(RwLock::new(state::PatternManager::new()))
    .manage(RwLock::new(state::HistoryManager::<R>::new()));

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
    .plugin(tauri_plugin_clipboard_manager::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_pinia::init());

  builder = builder.invoke_handler(tauri::generate_handler![
    commands::core::pattern::load_pattern,
    commands::core::pattern::open_pattern,
    commands::core::pattern::create_pattern,
    commands::core::pattern::save_pattern,
    commands::core::pattern::save_all_patterns,
    commands::core::pattern::export_pattern,
    commands::core::pattern::close_pattern,
    commands::core::pattern::close_all_patterns,
    commands::core::pattern::get_opened_patterns,
    commands::core::pattern::get_unsaved_patterns,
    commands::core::pattern::get_pattern_file_path,
    commands::core::pattern::update_pattern_info,
    commands::core::image::set_reference_image,
    commands::core::image::remove_reference_image,
    commands::core::image::update_reference_image_settings,
    commands::core::display::set_display_mode,
    commands::core::display::show_symbols,
    commands::core::display::set_layers_visibility,
    commands::core::fabric::update_fabric,
    commands::core::grid::update_grid,
    commands::core::palette::add_palette_item,
    commands::core::palette::remove_palette_items,
    commands::core::palette::update_palette_display_settings,
    commands::core::stitches::add_stitch,
    commands::core::stitches::remove_stitch,
    commands::core::publish::update_pdf_export_options,
    commands::core::history::undo,
    commands::core::history::redo,
    commands::core::history::start_transaction,
    commands::core::history::end_transaction,
    commands::core::fonts::load_stitch_font,
    commands::utils::path::get_app_document_dir,
    commands::utils::system::get_system_info,
  ]);

  builder
    .build(tauri::generate_context!())
    .expect("Failed to build Embroiderly")
}
