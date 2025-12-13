#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
  os_type: String,
  os_arch: String,
  os_version: String,
  app_version: String,
  webview_version: String,
}

#[tracing::instrument(level = "trace", skip_all)]
#[tauri::command]
pub fn get_system_info<R: tauri::Runtime>(app_handle: tauri::AppHandle<R>) -> SystemInfo {
  let webview_version = match tauri::webview_version() {
    Ok(version) => version,
    Err(e) => {
      tracing::error!("Failed to get webview version: {e}");
      String::new()
    }
  };

  SystemInfo {
    os_type: tauri_plugin_os::type_().to_string(),
    os_arch: tauri_plugin_os::arch().to_string(),
    os_version: tauri_plugin_os::version().to_string(),
    app_version: app_handle.package_info().version.to_string(),
    webview_version,
  }
}
