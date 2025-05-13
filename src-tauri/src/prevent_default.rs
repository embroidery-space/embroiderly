#[cfg(debug_assertions)]
pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
  use tauri_plugin_prevent_default::Flags;

  tauri_plugin_prevent_default::Builder::new()
    .with_flags(Flags::all().difference(Flags::DEV_TOOLS | Flags::RELOAD))
    .build()
}

#[cfg(not(debug_assertions))]
pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
  tauri_plugin_prevent_default::init()
}
