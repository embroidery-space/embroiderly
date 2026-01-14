use tauri_plugin_pinia::ManagerExt as _;

/// The action to perform on application startup.
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, serde::Deserialize)]
pub enum StartupAction {
  /// Do nothing. Users will start on the welcome screen.
  Nothing,

  /// Create a new empty pattern and open it immediately in the pattern editor.
  #[default]
  NewPattern,

  /// Load a copy of the specified pattern (the template pattern) and open it in the pattern editor.
  CustomTemplate,
}

/// Returns the startup action from user settings.
pub fn startup_action<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> StartupAction {
  app_handle
    .pinia()
    .get_raw("embroiderly-settings", "startup")
    .and_then(|v| v.get("action").cloned())
    .and_then(|v| serde_json::from_value(v).ok())
    .unwrap_or_default()
}

/// Returns the startup pattern template path from user settings.
pub fn startup_template_path<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> Option<std::path::PathBuf> {
  app_handle
    .pinia()
    .get_raw("embroiderly-settings", "startup")
    .and_then(|v| v.get("templatePath").cloned())
    .and_then(|v| serde_json::from_value::<String>(v).ok())
    .filter(|s| !s.is_empty())
    .map(std::path::PathBuf::from)
}

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

/// Returns whether diagnostics are enabled from user settings.
#[allow(unused_variables, clippy::missing_const_for_fn)]
pub fn telemetry_diagnostics_enabled<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> bool {
  #[cfg(not(debug_assertions))]
  let diagnostics_enabled = app_handle
    .pinia()
    .get_raw("embroiderly-settings", "telemetry")
    .and_then(|v| v.get("diagnostics").cloned())
    .and_then(|v| serde_json::from_value(v).ok())
    .unwrap_or(false);
  #[cfg(debug_assertions)]
  let diagnostics_enabled = false;

  diagnostics_enabled
}

/// Returns whether metrics collection is enabled from user settings.
#[allow(unused_variables, clippy::missing_const_for_fn)]
pub fn telemetry_metrics_enabled<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> bool {
  #[cfg(not(debug_assertions))]
  let metrics_enabled = app_handle
    .pinia()
    .get_raw("embroiderly-settings", "telemetry")
    .and_then(|v| v.get("metrics").cloned())
    .and_then(|v| serde_json::from_value(v).ok())
    .unwrap_or(false);
  #[cfg(debug_assertions)]
  let metrics_enabled = false;

  metrics_enabled
}
