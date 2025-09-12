use std::sync::RwLock;

use tauri::Manager as _;
use tauri_plugin_posthog::PostHogExt as _;

pub mod commands;
mod core;
mod error;
mod sidecars;
mod utils;
pub mod vendor;

pub mod state;
use state::{HistoryManager, HistoryState, PatternManager, PatternsState};

/// Runs the application.
pub fn run() {
  setup_app(tauri::Builder::default()).run(|app_handle, event| {
    match event {
      // Yeah, we don't currently support MacOS, but keep the code for future use.
      #[cfg(any(target_os = "macos", target_os = "ios"))]
      tauri::RunEvent::Opened { urls } => {
        let files = urls
          .into_iter()
          .filter_map(|url| url.to_file_path().ok())
          .collect::<Vec<_>>();
        handle_file_associations(app_handle, files);
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
        let files = collect_files_from_args();
        handle_file_associations(app_handle, files)?;
      }

      #[cfg(not(debug_assertions))]
      copy_sample_patterns(app_handle)?;

      run_auto_save_background_process(app_handle);

      Ok(())
    })
    .manage(RwLock::new(PatternManager::new()))
    .manage(RwLock::new(HistoryManager::<R>::new()));

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

fn create_webview_window<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> anyhow::Result<tauri::WebviewWindow<R>> {
  let webview_window = {
    #[allow(unused_mut)]
    let mut webview_window_builder = tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::default())
      .title(app.package_info().name.clone())
      .min_inner_size(640.0, 480.0)
      .maximized(true)
      .decorations(false)
      .visible(cfg!(debug_assertions))
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
fn copy_sample_patterns<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<()> {
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
  let interval = crate::utils::settings::auto_save_interval(app_handle);
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
        if let Err(err) = commands::core::pattern::save_pattern(
          pattern_id,
          file_path,
          app_handle.clone(),
          app_handle.state::<HistoryState<R>>(),
          app_handle.state::<PatternsState>(),
        ) {
          log::error!("Failed to auto-save Pattern({pattern_id:?}): {err:?}");
        }
      }

      log::debug!("Auto-save completed.");
    }
  });
}

fn collect_files_from_args() -> Vec<std::path::PathBuf> {
  let mut files = Vec::new();

  // `args` may include URL protocol (`file://`) or arguments (`--`).
  for maybe_file in std::env::args().skip(1) {
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

fn handle_file_associations<R: tauri::Runtime>(
  app_handle: &tauri::AppHandle<R>,
  files: Vec<std::path::PathBuf>,
) -> anyhow::Result<tauri::WebviewWindow<R>> {
  // Load pattern files to the memory so that they can be accessed from the frontend later.
  for file in files {
    commands::core::pattern::open_pattern(
      file,
      Some(false),
      app_handle.clone(),
      app_handle.state::<PatternsState>(),
    )?;
  }

  create_webview_window(app_handle)
}
