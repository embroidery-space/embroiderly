use tauri_plugin_sentry::sentry;

pub fn init<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<()> {
  init_diagnostics(app_handle)?;
  Ok(())
}

fn init_diagnostics<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<()> {
  // Get a configuration setting from the config.
  #[cfg(not(debug_assertions))]
  let diagnostics_enabled = {
    use tauri_plugin_pinia::ManagerExt as _;
    app_handle
      .pinia()
      .get("embroiderly-settings", "telemetry")
      .and_then(|v| v.get("diagnostics").cloned())
      .and_then(|v| serde_json::from_value(v).ok())
      .unwrap_or(false)
  };
  #[cfg(debug_assertions)]
  let diagnostics_enabled = false;

  // Get the release name.
  let package_info = app_handle.package_info();
  let release_name = format!("{}@{}", package_info.name, package_info.version).to_lowercase();

  // Configure Sentry.
  let client_options = sentry::ClientOptions {
    release: Some(std::borrow::Cow::Owned(release_name)),
    auto_session_tracking: true,
    debug: cfg!(debug_assertions),
    ..Default::default()
  };
  let client = if let Some(dsn) = std::option_env!("SENTRY_DSN")
    && diagnostics_enabled
  {
    log::info!("Telemetry: Diagnostics is enabled.");
    sentry::init((dsn, client_options))
  } else {
    log::info!("Telemetry: Diagnostics is disabled.");
    sentry::init(client_options)
  };

  // Set up Tauri plugin.
  app_handle.plugin(tauri_plugin_sentry::init(&client))?;

  // The client guard must be kept valid for the entire application run time for the correct work.
  // We can't do this since we have to init the Sentry client in an inner scope to access the user's settings.
  // So we just "forget" about it, for now.
  std::mem::forget(client);

  Ok(())
}
