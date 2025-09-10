#[tauri::command]
pub fn capture_event<R: tauri::Runtime>(
  event: String,
  properties: std::collections::HashMap<String, serde_json::Value>,
  app_handle: tauri::AppHandle<R>,
  client: tauri::State<'_, crate::PostHogClientState>,
  device_id: tauri::State<'_, crate::DeviceId>,
  session_id: tauri::State<'_, crate::SessionId>,
) {
  let package_info = app_handle.package_info().clone();

  let client = client.inner().clone();
  let device_id = device_id.inner().clone();
  let session_id = session_id.inner().clone();

  std::thread::spawn(move || {
    let event = crate::utils::create_event(
      event,
      properties,
      device_id.as_str().to_string(),
      session_id.as_str().to_string(),
    );
    let event = crate::utils::saturate_event(event, &package_info);

    if let Err(e) = client.capture(event) {
      log::error!("Failed to capture event: {e}");
    }
  });
}
