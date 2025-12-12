pub fn init<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<()> {
  embroiderly_tracing::init("embroiderly", crate::utils::path::app_logs_dir(app_handle)?)?;
  app_handle.plugin(tauri_plugin_log::init())?;
  Ok(())
}
