use tauri::Manager;

use crate::commands;
use crate::state::{HistoryState, PatternsState};

/// Runs the auto-save background process.
/// This function starts a background thread that periodically saves all open patterns
/// based on the configured auto-save interval.
pub fn run_auto_save_background_process<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) {
  let interval = crate::utils::settings::auto_save_interval(app_handle);
  if interval.is_zero() {
    log::debug!("Auto-save is disabled.");
    return;
  }

  let app_handle = app_handle.clone();
  std::thread::spawn(move || {
    loop {
      std::thread::sleep(interval);
      log::debug!("Auto-saving patterns...");

      let patterns = app_handle.state::<PatternsState>();
      let patterns = patterns
        .read()
        .unwrap()
        .patterns()
        .map(|p| (p.id, p.file_path.clone()))
        .collect::<Vec<_>>();
      for (pattern_id, file_path) in patterns {
        if let Err(err) = commands::core::pattern::save_pattern(
          pattern_id,
          file_path,
          app_handle.clone(),
          app_handle.state::<HistoryState<R>>(),
          app_handle.state::<PatternsState>(),
        ) {
          log::error!("Failed to auto-save Pattern({pattern_id:?}): {err:?}");
        }
      }

      log::debug!("Auto-save completed.");
    }
  });
}
