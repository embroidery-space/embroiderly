use super::sentry;

pub fn init<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<()> {
  // Configure Sentry.
  let client_options = sentry::ClientOptions {
    release: Some(std::borrow::Cow::Owned(sentry_release_name(app_handle.package_info()))),
    auto_session_tracking: true,
    debug: cfg!(debug_assertions),
    ..Default::default()
  };
  let client = if let Some(dsn) = option_env!("EMBROIDERLY_SENTRY_DSN")
    && crate::utils::settings::telemetry_diagnostics_enabled(app_handle)
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

/// Returns the release name for Sentry.
pub fn sentry_release_name(package_info: &tauri::PackageInfo) -> String {
  format!("{}@{}", package_info.name, package_info.version).to_lowercase()
}
