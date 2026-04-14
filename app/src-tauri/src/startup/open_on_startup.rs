use embroiderly_pattern::{Pattern, PatternProject};
use tauri::Manager as _;

use crate::state::{HistoryState, PatternsState, StartupNotification, StartupNotificationsState};
use crate::utils::settings::StartupAction;

/// Handles the "open on startup" setting.
/// Creates a new pattern or loads the specified template based on user preferences.
pub fn handle_open_on_startup<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) {
  let patterns = app_handle.state::<PatternsState>();
  if !patterns.read().unwrap().is_empty() {
    // Skip if there are already patterns open (e.g., from file associations).
    return;
  }

  match crate::utils::settings::startup_action(app_handle) {
    StartupAction::Nothing => {
      tracing::info!(target: "startup", "Open on startup: nothing");
    }
    StartupAction::NewPattern => {
      tracing::info!(target: "startup", "Open on startup: new pattern");
      create_new_pattern(app_handle);
    }
    StartupAction::CustomTemplate => {
      tracing::info!(target: "startup", "Open on startup: custom template");
      if let Some(template_path) = crate::utils::settings::startup_template_path(app_handle) {
        load_template(app_handle, &template_path);
      }
    }
  }
}

fn create_new_pattern<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) {
  let patproj = PatternProject::new(Pattern::default());

  let history = app_handle.state::<HistoryState<R>>();
  history.write().unwrap().create(patproj.id);

  let patterns = app_handle.state::<PatternsState>();
  patterns.write().unwrap().add_pattern(patproj);
}

fn load_template<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>, template_path: &std::path::Path) {
  let result = (|| -> anyhow::Result<_> {
    let data = std::fs::read(template_path)?;
    let file_name = template_path.file_name().and_then(|s| s.to_str()).unwrap_or_default();
    Ok(embroiderly_parsers::parse_pattern(&data, file_name)?)
  })();

  match result {
    Ok(mut patproj) => {
      patproj.file_path = None;

      let history = app_handle.state::<HistoryState<R>>();
      history.write().unwrap().create(patproj.id);

      let patterns = app_handle.state::<PatternsState>();
      patterns.write().unwrap().add_pattern(patproj);
    }
    Err(err) => {
      tracing::error!(target: "startup", ?template_path, ?err, "Failed to load pattern template");

      let notifications = app_handle.state::<StartupNotificationsState>();
      notifications
        .lock()
        .unwrap()
        .push(StartupNotification::TemplateFailed(template_path.to_path_buf()));
    }
  }
}
