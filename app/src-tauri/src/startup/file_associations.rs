use tauri::Manager as _;

/// Handles file associations by loading pattern files.
/// This function loads the specified pattern files into memory so they can be accessed from the frontend.
pub fn handle_file_associations<R: tauri::Runtime>(
  app_handle: &tauri::AppHandle<R>,
  args: impl IntoIterator<Item = String>,
) -> anyhow::Result<()> {
  for file in collect_files_from_args(args) {
    crate::commands::core::pattern::open_pattern(
      file,
      Some(false),
      app_handle.clone(),
      app_handle.state::<crate::state::PatternsState>(),
    )?;
  }
  Ok(())
}

/// Collects file paths from command line arguments.
/// This function parses command line arguments to extract file paths, handling both regular file paths and `file://` URLs.
fn collect_files_from_args(args: impl IntoIterator<Item = String>) -> Vec<std::path::PathBuf> {
  let mut files = Vec::new();

  // `args` may include URL protocol (`file://`) or arguments (`-a`, `--arg`).
  for maybe_file in args {
    if maybe_file.starts_with('-') {
      continue;
    }

    if maybe_file.starts_with("file://") {
      if let Ok(url) = tauri::Url::parse(&maybe_file)
        && let Ok(path) = url.to_file_path()
      {
        files.push(path);
      }
    } else {
      files.push(maybe_file.into());
    }
  }

  files
}
