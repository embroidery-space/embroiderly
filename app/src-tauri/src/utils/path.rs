use std::path::{Path, PathBuf};

#[allow(unused)]
use tauri::Manager as _;

/// Returns the path to the application's data directory.
pub fn app_data_dir<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<PathBuf> {
  #[cfg(feature = "test")]
  let app_data_dir = std::env::temp_dir();
  #[cfg(not(feature = "test"))]
  let app_data_dir = app_handle.path().app_data_dir()?;
  Ok(app_data_dir.join(&app_handle.package_info().name))
}

pub fn app_document_dir<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<PathBuf> {
  #[cfg(feature = "test")]
  let document_dir = std::env::temp_dir();
  #[cfg(not(feature = "test"))]
  let document_dir = app_handle.path().document_dir()?;
  Ok(document_dir.join(&app_handle.package_info().name))
}

/// Returns the path to the application's log directory.
#[allow(unused_variables, clippy::unnecessary_wraps)]
pub fn app_logs_dir<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<PathBuf> {
  #[cfg(not(debug_assertions))]
  let logs_dir = app_handle.path().app_log_dir()?; // In production, store logs in the application's log directory.
  #[cfg(debug_assertions)]
  let logs_dir = std::path::PathBuf::from("logs"); // In development, store logs in the `logs` directory near to the sources.
  Ok(logs_dir)
}

/// Resolves the path to the application's resources.
pub fn resolve_app_resources<P: AsRef<Path>>(path: P) -> anyhow::Result<PathBuf> {
  let exe_path = tauri::utils::platform::current_exe()?;
  let exe_dir = exe_path.parent().expect("Executable must have a parent.");
  let base_dir = if exe_dir.ends_with("deps") {
    // In tests, we need to go one directory up to find the resources directory.
    exe_dir.parent().unwrap_or(exe_dir)
  } else {
    exe_dir
  };
  Ok(base_dir.join(path))
}

/// Returns the pattern backup path.
pub fn backup_file_path<P: AsRef<Path>>(file_path: P, postfix: &str) -> PathBuf {
  let file_path = file_path.as_ref();
  let file_stem = file_path
    .file_stem()
    .map_or_else(String::new, |stem| stem.to_string_lossy().to_string());
  let extension = file_path
    .extension()
    .map_or_else(String::new, |stem| stem.to_string_lossy().to_string());
  let new_file_name = format!(".{file_stem}.{postfix}.{extension}");
  file_path.with_file_name(new_file_name)
}
