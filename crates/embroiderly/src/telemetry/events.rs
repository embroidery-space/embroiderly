/// Represents all telemetry events that can occur in the application.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum AppEvent {
  PatternOpened,
}

impl tauri_plugin_posthog::ToPostHogEvent for AppEvent {
  fn event_name(&self) -> &str {
    match self {
      AppEvent::PatternOpened => "pattern_opened",
    }
  }

  fn properties(&self) -> std::collections::HashMap<String, serde_json::Value> {
    use serde_json::json;

    match self {
      AppEvent::PatternOpened => [],
    }
    .into()
  }
}
