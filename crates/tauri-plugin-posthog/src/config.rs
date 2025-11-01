use std::sync::Arc;

use crate::posthog;

pub type BeforeSendFn = Arc<dyn Fn(&mut posthog::Event) -> bool + Send + Sync>;

/// Configuration for the PostHog plugin.
#[derive(Default)]
pub struct PostHogConfig {
  /// Optional function to modify or discard events before sending.
  /// If the function returns `false`, the event will be discarded.
  pub before_send: Option<BeforeSendFn>,
}

impl PostHogConfig {
  /// Creates a new `PostHogConfig` with default settings.
  pub fn new() -> Self {
    Self::default()
  }

  /// Sets the `before_send` function.
  pub fn with_before_send<F>(mut self, before_send: F) -> Self
  where
    F: Fn(&mut posthog::Event) -> bool + Send + Sync + 'static,
  {
    self.before_send = Some(Arc::new(before_send));
    self
  }
}
