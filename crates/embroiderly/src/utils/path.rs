use std::path::{Path, PathBuf};

use tauri::Manager as _;

pub fn app_document_dir<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<PathBuf> {
  let app_name = app_handle.config().product_name.clone().unwrap();
  let dir_path = if cfg!(test) {
    std::env::temp_dir()
  } else {
    let path_resolver = app_handle.path();
    path_resolver
      .document_dir()
      // We expect the home directory to always be available.
      .unwrap_or_else(|_| path_resolver.home_dir().unwrap())
  };
  Ok(dir_path.join(app_name))
}

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
