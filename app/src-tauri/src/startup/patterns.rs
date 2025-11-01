use tauri::Manager as _;

/// Copies sample patterns to the application document directory.
/// This function creates the Embroiderly directory in the user's document directory and copies the sample patterns there if it doesn't exist.
#[allow(dead_code)]
pub fn copy_sample_patterns<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<()> {
  let app_document_dir = crate::utils::path::app_document_dir(app_handle)?;
  if !app_document_dir.exists() {
    // Create the Embroiderly directory in the user's document directory
    // and copy the sample patterns there if it doesn't exist.
    log::debug!("Creating an app document directory",);
    std::fs::create_dir(&app_document_dir)?;
    log::debug!("Copying sample patterns to the app document directory");
    let patterns_path = app_handle
      .path()
      .resolve("resources/patterns/", tauri::path::BaseDirectory::Resource)?;
    for pattern in std::fs::read_dir(patterns_path)? {
      let pattern = pattern?.path();
      std::fs::copy(pattern.clone(), app_document_dir.join(pattern.file_name().unwrap()))?;
    }
  }
  Ok(())
}
