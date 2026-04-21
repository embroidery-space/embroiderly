use std::path::PathBuf;

#[allow(unused)]
use tauri::Manager as _;

/// Returns the path to the application's log directory.
#[allow(unused_variables, clippy::unnecessary_wraps)]
pub fn app_logs_dir<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<PathBuf> {
  #[cfg(not(debug_assertions))]
  let logs_dir = app_handle.path().app_log_dir()?; // In production, store logs in the application's log directory.
  #[cfg(debug_assertions)]
  let logs_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../logs"); // In development, store logs in the `app/logs/` directory.
  Ok(logs_dir)
}
