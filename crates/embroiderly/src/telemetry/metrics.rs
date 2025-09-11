use serde_json::json;
use tauri::Manager as _;

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
  app_handle.plugin(tauri_plugin_posthog::init(
    client,
    tauri_plugin_posthog::PostHogConfig::new().with_before_send({
      let app_handle = app_handle.clone();
      move |event| {
        saturate_event_with_monitor_and_window_properties(event, &app_handle);
        true
      }
    }),
  ))?;

  Ok(())
}

fn saturate_event_with_monitor_and_window_properties<R: tauri::Runtime>(
  event: &mut posthog::Event,
  app_handle: &tauri::AppHandle<R>,
) {
  if let Some(webview_window) = app_handle.get_webview_window("main") {
    let mut properties = vec![];

    // Set primary monitor properties.
    if let Ok(Some(monitor)) = webview_window.primary_monitor() {
      let size = monitor.size();
      let work_area = monitor.work_area();
      let scale = monitor.scale_factor();

      properties.extend([
        ("primary_monitor_size", json!(format!("{}x{}", size.width, size.height))),
        (
          "primary_monitor_work_area_size",
          json!(format!("{}x{}", work_area.size.width, work_area.size.height)),
        ),
        ("primary_monitor_scale_factor", json!(scale)),
      ]);
    }

    // Set current monitor properties.
    if let Ok(Some(monitor)) = webview_window.current_monitor() {
      let size = monitor.size();
      let work_area = monitor.work_area();
      let scale = monitor.scale_factor();

      properties.extend([
        ("current_monitor_size", json!(format!("{}x{}", size.width, size.height))),
        (
          "current_monitor_work_area_size",
          json!(format!("{}x{}", work_area.size.width, work_area.size.height)),
        ),
        ("current_monitor_scale_factor", json!(scale)),
      ]);
    }

    // Set window properties.
    {
      let size = webview_window.inner_size().ok();
      let position = webview_window.inner_position().ok();
      let scale = webview_window.scale_factor().ok();

      properties.extend([
        (
          "window_size",
          json!(size.map(|size| format!("{}x{}", size.width, size.height))),
        ),
        (
          "window_position",
          json!(position.map(|position| format!("{}x{}", position.x, position.y))),
        ),
        ("window_scale_factor", json!(scale)),
      ]);
    }

    for (key, value) in properties {
      event
        .insert_prop(key, value)
        .expect("JSON values are always serializable");
    }
  }
}
