use embroiderly_logger::APPLICATION_LOG_LEVEL;

/// Initializes the logger for the main application.
pub fn init<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<()> {
  let dispatch = embroiderly_logger::init_main_logger(crate::utils::path::app_logs_dir(app_handle)?)?
    .level_for("embroiderly", APPLICATION_LOG_LEVEL.to_level_filter())
    .level_for("pmaker", APPLICATION_LOG_LEVEL.to_level_filter());
  dispatch.apply()?;

  app_handle.plugin(tauri_plugin_log::init())?;

  Ok(())
}
