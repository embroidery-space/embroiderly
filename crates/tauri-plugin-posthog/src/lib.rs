pub use posthog_rs as posthog;
use sha2::Digest as _;
use tauri::Manager as _;

mod commands;
mod utils;

/// Initializes the plugin.
pub fn init<R: tauri::Runtime>(client: posthog::Client) -> tauri::plugin::TauriPlugin<R> {
  tauri::plugin::Builder::new("posthog")
    .setup(move |app, _api| {
      app.manage(client);
      app.manage(DeviceId::new(app.package_info()));
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![commands::capture_event])
    .build()
}

/// A unique device identifier derived from machine UID and app info.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DeviceId(String);

impl DeviceId {
  /// Creates a new `DeviceId` by hashing machine UID with app name and version.
  /// Falls back to UUID v4 if machine UID cannot be obtained.
  pub fn new(package_info: &tauri::PackageInfo) -> Self {
    if let Ok(machine_uid) = machine_uid::get() {
      let mut hasher = sha2::Sha256::new();
      hasher.update(machine_uid.as_bytes());
      hasher.update(package_info.name.as_bytes());
      hasher.update(package_info.version.to_string().as_bytes());

      let hash = hasher.finalize();
      let device_id = format!("{:x}", hash);

      DeviceId(device_id)
    } else {
      DeviceId(uuid::Uuid::new_v4().to_string())
    }
  }

  /// Returns the device ID as a string.
  pub fn as_str(&self) -> &str {
    &self.0
  }
}

/// Extension trait for `tauri::AppHandle` to capture PostHog events.
pub trait PostHogExt<R: tauri::Runtime> {
  /// Captures a PostHog event with the given event data.
  fn capture_event(&self, event: impl ToPostHogEvent);
}

impl<R: tauri::Runtime> PostHogExt<R> for tauri::AppHandle<R> {
  fn capture_event(&self, event: impl ToPostHogEvent) {
    let posthog_client = self.state::<posthog::Client>();
    let device_id = self.state::<DeviceId>();

    let event_name = event.event_name();
    let properties = event.properties();

    let event = utils::create_event(event_name, device_id.as_str(), properties);
    let event = utils::saturate_event(event, self.package_info());

    if let Err(e) = posthog_client.capture(event) {
      log::error!("Failed to capture PostHog event: {e:?}",);
    }
  }
}

/// A trait for converting custom types to PostHog events.
pub trait ToPostHogEvent {
  /// Returns the event name as a string for telemetry systems.
  fn event_name(&self) -> &str;

  /// Extracts properties as a HashMap for telemetry systems.
  fn properties(&self) -> std::collections::HashMap<String, serde_json::Value>;
}
