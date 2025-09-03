use tauri_plugin_pinia::ManagerExt as _;

/// Returns the auto-save interval from user settings.
pub fn auto_save_interval<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> std::time::Duration {
  let interval = app_handle
    .pinia()
    .get("embroiderly-settings", "other")
    .and_then(|v| v.get("autoSaveInterval").cloned())
    .and_then(|v| serde_json::from_value(v).ok())
    .unwrap_or(15)
    .clamp(0, 240);
  std::time::Duration::from_secs(interval * 60)
}

/// Returns whether diagnostics are enabled from user settings.
#[allow(unused_variables)]
pub fn telemetry_diagnostics_enabled<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> bool {
  #[cfg(not(debug_assertions))]
  let diagnostics_enabled = app_handle
    .pinia()
    .get("embroiderly-settings", "telemetry")
    .and_then(|v| v.get("diagnostics").cloned())
    .and_then(|v| serde_json::from_value(v).ok())
    .unwrap_or(false);
  #[cfg(debug_assertions)]
  let diagnostics_enabled = false;

  diagnostics_enabled
}
