use tauri::Manager as _;

use crate::commands;
use crate::state::{HistoryState, PatternsState};

/// Runs the auto-save background process.
/// This function starts a background thread that periodically saves all open patterns
/// based on the configured auto-save interval.
pub fn run_auto_save_background_process<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) {
  let interval = crate::utils::settings::auto_save_interval(app_handle);
  if interval.is_zero() {
    tracing::info!(target: "startup", "Auto-save is disabled.");
    return;
  }

  tracing::info!(target: "startup", "Auto-save is enabled.");

  let app_handle = app_handle.clone();
  std::thread::spawn(move || {
    loop {
      std::thread::sleep(interval);

      let _guard = tracing::debug_span!("auto_save").entered();

      let patterns = app_handle.state::<PatternsState>();
      let patterns = patterns
        .read()
        .unwrap()
        .patterns()
        .filter_map(|p| p.file_path.clone().map(|path| (p.id, path)))
        .collect::<Vec<_>>();
      for (pattern_id, file_path) in patterns {
        if let Err(err) = commands::files::patterns::save_pattern(
          pattern_id,
          file_path,
          app_handle.clone(),
          app_handle.state::<HistoryState<R>>(),
          app_handle.state::<PatternsState>(),
        ) {
          tracing::error!(?pattern_id, "Failed to auto-save pattern: {err:?}");
        }
      }
    }
  });
}
