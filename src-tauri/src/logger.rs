use tauri_plugin_log::{Target, TargetKind};

const DEFAULT_LOG_LEVEL: log::Level = log::Level::Info;

#[cfg(debug_assertions)]
const APPLICATION_LOG_LEVEL: log::Level = log::Level::Trace;
#[cfg(not(debug_assertions))]
const APPLICATION_LOG_LEVEL: log::Level = log::Level::Debug;

pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
  log_panics::init();
  tauri_plugin_log::Builder::default()
    .clear_targets()
    .targets([
      // In debug mode, log to `stderr` and to `src-tauri/logs/debug.log` file.
      #[cfg(debug_assertions)]
      Target::new(TargetKind::Stderr),
      #[cfg(debug_assertions)]
      Target::new(TargetKind::Folder {
        path: std::path::PathBuf::from("logs"),
        file_name: Some(String::from("debug")),
      }),
      // In release mode, log to an application log dir.
      #[cfg(not(debug_assertions))]
      Target::new(TargetKind::LogDir { file_name: None }),
    ])
    .level(DEFAULT_LOG_LEVEL.to_level_filter())
    .level_for("embroiderly", APPLICATION_LOG_LEVEL.to_level_filter())
    .level_for("pmaker", APPLICATION_LOG_LEVEL.to_level_filter())
    .build()
}
