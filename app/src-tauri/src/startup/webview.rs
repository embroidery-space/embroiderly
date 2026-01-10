/// Creates the main webview window for the application.
/// This function configures and creates the primary application window with appropriate settings for development and production environments.
pub fn create_webview_window<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> anyhow::Result<tauri::WebviewWindow<R>> {
  let webview_window = {
    #[allow(unused_mut)]
    let mut webview_window_builder = tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::default())
      .title(app.package_info().name.clone())
      .min_inner_size(640.0, 480.0)
      .maximized(true)
      .decorations(false)
      .visible(cfg!(debug_assertions));

    // We enable browser extensions only for development.
    #[cfg(all(debug_assertions, target_os = "windows"))]
    {
      // Skip installing browser extensions for automation testing.
      // This env var is set by `tauri-driver`.
      if std::env::var("TAURI_WEBVIEW_AUTOMATION").is_err() {
        // Enable and setup browser extensions for development.
        webview_window_builder = webview_window_builder
          .browser_extensions_enabled(true)
          // Load the browser extensions from the `src-tauri/extensions/` directory.
          .extensions_path(std::env::current_dir()?.join("extensions"));
      }
    }

    webview_window_builder.build()?
  };

  #[cfg(debug_assertions)]
  // Skip opening devtools for automation testing.
  if std::env::var("TAURI_WEBVIEW_AUTOMATION").is_err() {
    webview_window.open_devtools();
  }

  Ok(webview_window)
}
