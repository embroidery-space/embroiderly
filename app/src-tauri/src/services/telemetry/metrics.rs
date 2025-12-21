use tauri::Manager as _;

use super::posthog;

pub fn init<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> anyhow::Result<()> {
  // Configure PostHog.
  let client_options = posthog::ClientOptions {
    host: posthog::Host::EU,
    before_send: vec![{
      let app_handle = app_handle.clone();
      Box::new(move |mut event| {
        saturate_event_with_monitor_and_window_properties(&mut event, &app_handle);
        Some(event)
      })
    }],
    ..Default::default()
  };
  let client = if let Some(api_key) = option_env!("EMBROIDERLY_POSTHOG_API_KEY")
    && crate::utils::settings::telemetry_metrics_enabled(app_handle)
  {
    tracing::info!(target: "telemetry", "Metrics is enabled.");
    posthog::init((api_key, client_options))
  } else {
    tracing::info!(target: "telemetry", "Metrics is disabled.");
    posthog::init(client_options)
  };

  // Set up Tauri plugin.
  app_handle.plugin(tauri_plugin_better_posthog::init())?;

  // The client guard must be kept valid for the entire application run time for the correct work.
  // We can't do this since we have to init the PostHog client in an inner scope to access the user's settings.
  // So we just "forget" about it, for now.
  std::mem::forget(client);

  Ok(())
}

fn saturate_event_with_monitor_and_window_properties<R: tauri::Runtime>(
  event: &mut posthog::Event,
  app_handle: &tauri::AppHandle<R>,
) {
  if let Some(webview_window) = app_handle.get_webview_window("main") {
    // Set primary monitor properties.
    if let Ok(Some(monitor)) = webview_window.primary_monitor() {
      let size = monitor.size();
      event.insert_property("primary_monitor_size", format!("{}x{}", size.width, size.height));

      let work_area = monitor.work_area();
      event.insert_property(
        "primary_monitor_work_area_size",
        format!("{}x{}", work_area.size.width, work_area.size.height),
      );

      event.insert_property("primary_monitor_scale_factor", monitor.scale_factor());
    }

    // Set current monitor properties.
    if let Ok(Some(monitor)) = webview_window.current_monitor() {
      let size = monitor.size();
      event.insert_property("current_monitor_size", format!("{}x{}", size.width, size.height));

      let work_area = monitor.work_area();
      event.insert_property(
        "current_monitor_work_area_size",
        format!("{}x{}", work_area.size.width, work_area.size.height),
      );

      event.insert_property("current_monitor_scale_factor", monitor.scale_factor());
    }

    // Set window properties.
    {
      let size = webview_window.inner_size().ok();
      event.insert_property(
        "window_size",
        size.map(|size| format!("{}x{}", size.width, size.height)),
      );

      let position = webview_window.inner_position().ok();
      event.insert_property(
        "window_position",
        position.map(|position| format!("{}x{}", position.x, position.y)),
      );

      event.insert_property("window_scale_factor", webview_window.scale_factor().ok());
    }
  }
}
