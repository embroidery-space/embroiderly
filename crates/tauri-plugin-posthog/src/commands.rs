#[tauri::command]
pub fn capture_event<R: tauri::Runtime>(
  event: String,
  properties: std::collections::HashMap<String, serde_json::Value>,
  app_handle: tauri::AppHandle<R>,
  posthog_client: tauri::State<'_, posthog_rs::Client>,
  device_id: tauri::State<'_, crate::DeviceId>,
) {
  let event = crate::utils::create_event(event, device_id.as_str().to_string(), properties);
  let event = crate::utils::saturate_event(event, app_handle.package_info());

  if let Err(e) = posthog_client.capture(event) {
    log::error!("Failed to capture event: {e}");
  }
}
