pub use tauri_plugin_posthog::posthog;
pub use tauri_plugin_sentry::sentry;

mod diagnostics;
mod events;
mod metrics;

pub use diagnostics::sentry_release_name;
pub use events::AppEvent;

pub fn init<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<()> {
  diagnostics::init(app_handle)?;
  metrics::init(app_handle)?;
  Ok(())
}
