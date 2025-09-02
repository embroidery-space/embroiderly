mod commands;

/// Initializes the plugin.
pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
  tauri::plugin::Builder::new("log")
    .invoke_handler(tauri::generate_handler![commands::log])
    .build()
}
