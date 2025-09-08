use super::posthog;

pub fn init<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<()> {
  // Configure PostHog.
  let client = if let Some(api_key) = option_env!("EMBROIDERLY_POSTHOG_API_KEY")
    && crate::utils::settings::telemetry_metrics_enabled(app_handle)
  {
    log::info!("Telemetry: Metrics is enabled.");
    posthog::client(
      posthog::ClientOptionsBuilder::default()
        .api_endpoint("https://eu.i.posthog.com/i/v0/e/".into())
        .api_key(api_key.into())
        .build()?,
    )
  } else {
    log::info!("Telemetry: Metrics is disabled.");
    posthog::client("dummy-key")
  };

  // Set up Tauri plugin.
  app_handle.plugin(tauri_plugin_posthog::init(client))?;

  Ok(())
}
