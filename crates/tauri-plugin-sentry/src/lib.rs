pub use sentry;
use tauri::Manager as _;

mod commands;

/// Initializes the plugin.
pub fn init<R: tauri::Runtime>(client: &sentry::Client) -> tauri::plugin::TauriPlugin<R> {
  let client = client.clone();
  tauri::plugin::Builder::new("sentry")
    .setup(move |app, _api| {
      app.manage(client);
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![commands::envelope, commands::add_breadcrumb])
    .build()
}
