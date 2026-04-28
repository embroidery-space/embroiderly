#[allow(unused)]
use tauri::Manager as _;

pub fn init<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<()> {
  #[cfg(not(debug_assertions))]
  let log_dir = app_handle.path().app_log_dir()?; // In production, store logs in the application's log directory.
  #[cfg(debug_assertions)]
  let log_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../logs"); // In development, store logs in the `app/logs/` directory.

  embroiderly_tracing::init("embroiderly", log_dir)?;
  app_handle.plugin(crate::plugins::log::init())?;

  Ok(())
}
