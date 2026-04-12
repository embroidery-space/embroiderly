/// Creates the main webview window for the application.
/// This function configures and creates the primary application window with appropriate settings for development and production environments.
pub fn create_webview_window<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> anyhow::Result<tauri::WebviewWindow<R>> {
  let webview_window = tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::default())
    .title(app.package_info().name.clone())
    .min_inner_size(640.0, 480.0)
    .maximized(true)
    .decorations(false)
    .visible(cfg!(debug_assertions))
    .build()?;

  #[cfg(debug_assertions)]
  // Skip opening devtools for automation testing.
  if std::env::var("TAURI_WEBVIEW_AUTOMATION").is_err() {
    webview_window.open_devtools();
  }

  Ok(webview_window)
}
