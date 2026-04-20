use tauri_plugin_pinia::ManagerExt as _;

/// Returns the auto-save interval from user settings.
pub fn auto_save_interval<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> std::time::Duration {
  let interval = app_handle
    .pinia()
    .get_raw("embroiderly-settings", "other")
    .and_then(|v| v.get("autoSaveInterval").cloned())
    .and_then(|v| serde_json::from_value(v).ok())
    .unwrap_or(15)
    .clamp(0, 240);
  std::time::Duration::from_secs(interval * 60)
}
