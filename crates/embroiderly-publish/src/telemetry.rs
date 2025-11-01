pub fn init() -> anyhow::Result<Vec<Box<dyn std::any::Any>>> {
  let guard = init_diagnostics()?;
  Ok(vec![Box::new(guard)])
}

fn init_diagnostics() -> anyhow::Result<sentry::ClientInitGuard> {
  // Configure Sentry.
  let client_options = sentry::ClientOptions {
    release: if let Ok(release_name) = std::env::var("SENTRY_RELEASE_NAME") {
      Some(std::borrow::Cow::Owned(release_name))
    } else {
      None
    },
    auto_session_tracking: true,
    debug: cfg!(debug_assertions),
    ..Default::default()
  };
  let client = if let Ok(dsn) = std::env::var("SENTRY_DSN") {
    log::info!("Telemetry: Sentry is enabled.");
    sentry::init((dsn, client_options))
  } else {
    log::info!("Telemetry: Sentry is disabled.");
    sentry::init(client_options)
  };

  Ok(client)
}
