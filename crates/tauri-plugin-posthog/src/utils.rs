use serde_json::json;

use crate::posthog;

/// Creates a new event with the given name, distinct ID, and properties.
pub fn create_event(
  name: String,
  mut properties: std::collections::HashMap<String, serde_json::Value>,
  distinct_id: String,
  session_id: String,
) -> posthog::Event {
  let mut event = posthog::Event::new(name, distinct_id.clone());

  // The `token` property comes from the frontend where we use a dummy API key.
  // So we don't want to store it in the properties.
  properties.remove("token");

  properties.insert("distinct_id".to_string(), json!(distinct_id));
  properties.insert("$device_id".to_string(), json!(distinct_id.clone()));
  properties.insert("$session_id".to_string(), json!(session_id));

  for (key, value) in properties {
    event
      .insert_prop(key, value)
      .expect("JSON values are always serializable");
  }

  event
}

/// Saturates an event with system properties and package information.
pub fn saturate_event(mut event: posthog::Event, package_info: &tauri::PackageInfo) -> posthog::Event {
  for (key, value) in [
    // OS properties.
    ("$os", json!(tauri_plugin_os::type_().to_string())),
    ("$os_version", json!(tauri_plugin_os::version().to_string())),
    ("$os_arch", json!(tauri_plugin_os::arch().to_string())),
    // Browser (WebView) properties.
    #[cfg(windows)]
    ("$browser", json!("webview2")),
    #[cfg(not(windows))]
    ("$browser", json!("webkit")),
    ("$browser_version", json!(tauri::webview_version().ok())),
    // Application properties.
    ("$app_version", json!(package_info.version.to_string())),
  ] {
    event
      .insert_prop(key, value)
      .expect("JSON values are always serializable");
  }
  event
}
