use crate::{PostHogExt as _, ToPostHogEvent};

#[tauri::command]
pub fn capture_event<R: tauri::Runtime>(
  event: String,
  properties: std::collections::HashMap<String, serde_json::Value>,
  app_handle: tauri::AppHandle<R>,
) {
  app_handle.capture_event(ExternalEvent { event, properties });
}

struct ExternalEvent {
  event: String,
  properties: std::collections::HashMap<String, serde_json::Value>,
}

impl ToPostHogEvent for ExternalEvent {
  fn event_name(&self) -> &str {
    &self.event
  }

  fn properties(&self) -> std::collections::HashMap<String, serde_json::Value> {
    self.properties.clone()
  }
}
