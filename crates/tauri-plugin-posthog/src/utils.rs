use serde_json::json;

use crate::posthog;

/// Creates a new event with the given name, distinct ID, and properties.
pub fn create_event<S: Into<String>>(
  name: S,
  distinct_id: S,
  properties: std::collections::HashMap<String, serde_json::Value>,
) -> posthog::Event {
  let mut event = posthog::Event::new(name, distinct_id);
  for (key, value) in properties {
    event
      .insert_prop(key, value)
      .expect("serde_json::Value must always be serializable");
  }
  event
}

/// Saturates an event with system properties and package information.
pub fn saturate_event(mut event: posthog::Event, package_info: &tauri::PackageInfo) -> posthog::Event {
  let system_properties = [
    ("os_type", json!(tauri_plugin_os::type_().to_string())),
    ("os_arch", json!(tauri_plugin_os::arch().to_string())),
    ("os_version", json!(tauri_plugin_os::version().to_string())),
    ("app_version", json!(package_info.version.to_string())),
    ("webview_version", json!(tauri::webview_version().unwrap_or_default())),
  ];

  for (key, value) in system_properties {
    event
      .insert_prop(key, value)
      .expect("serde_json::Value must always be serializable");
  }

  event
}
