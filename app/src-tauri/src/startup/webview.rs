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
