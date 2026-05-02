// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod plugins;
mod services;

fn main() {
  #[allow(unused)]
  setup_app(tauri::Builder::default()).run(|app_handle, event| {
    match event {
      // Yeah, we don't currently support MacOS, but keep the code for future use.
      #[cfg(any(target_os = "macos", target_os = "ios"))]
      tauri::RunEvent::Opened { urls } => {
        let files = urls.into_iter().filter_map(|url| url.to_file_path().ok()).collect();
        create_webview_window(app_handle, files).unwrap();
      }
      _ => {}
    }
  });
}

/// Configures the application.
fn setup_app<R: tauri::Runtime>(mut builder: tauri::Builder<R>) -> tauri::App<R> {
  builder = builder.setup(|app| {
    let app_handle = app.handle();

    services::logger::init(app_handle)?;

    #[cfg(any(target_os = "windows", target_os = "linux"))]
    {
      let files = collect_files_from_args(std::env::args().skip(1));
      create_webview_window(app_handle, files)?;
    }

    Ok(())
  });

  {
    use tauri_plugin_prevent_default::Flags;
    builder = builder.plugin(
      tauri_plugin_prevent_default::Builder::new()
        .with_flags(Flags::all().difference(Flags::DEV_TOOLS | Flags::RELOAD))
        .build(),
    );
  }

  builder = builder
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_updater::Builder::new().build());

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
  use tauri_plugin_fs::FsExt as _;

  let fs_scope = app.fs_scope();

  let mut files_js = Vec::new();
  for file in files {
    // Allow the file to be read from the frontend.
    fs_scope.allow_file(&file)?;

    let path = file.to_string_lossy().replace('\\', "\\\\");
    files_js.push(format!("\"{path}\""));
  }

  let webview_window = tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::default())
    .title(app.package_info().name.clone())
    .min_inner_size(640.0, 480.0)
    .maximized(true)
    .decorations(false)
    .visible(cfg!(debug_assertions))
    .initialization_script(format!("window.openedFiles = [{}]", files_js.join(",")))
    .disable_drag_drop_handler()
    .build()?;

  // Skip opening devtools for automation testing.
  #[cfg(debug_assertions)]
  if std::env::var("TAURI_WEBVIEW_AUTOMATION").is_err() {
    webview_window.open_devtools();
  }

  Ok(webview_window)
}
