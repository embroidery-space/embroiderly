use tracing_subscriber::layer::SubscriberExt as _;
use tracing_subscriber::util::SubscriberInitExt as _;

pub const EMBROIDERLY_LOGS_DIR_ENV_VAR: &str = "EMBROIDERLY_LOGS_DIR";

const DEFAULT_LOG_LEVEL: tracing::Level = tracing::Level::INFO;

#[cfg(debug_assertions)]
const APPLICATION_LOG_LEVEL: tracing::Level = tracing::Level::TRACE;
#[cfg(not(debug_assertions))]
const APPLICATION_LOG_LEVEL: tracing::Level = tracing::Level::DEBUG;

pub fn init(binary_name: &str, logs_dir: std::path::PathBuf) -> anyhow::Result<()> {
  if !logs_dir.exists() {
    std::fs::create_dir_all(&logs_dir)?;
  }

  let logging_filter = default_env_filter();
  let file_layer = tracing_subscriber::fmt::layer()
    .with_ansi(false)
    .with_span_events(tracing_subscriber::fmt::format::FmtSpan::ACTIVE)
    .with_writer(
      std::fs::OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(logs_dir.join(format!("{binary_name}.log")))?,
    );
  let stderr_layer = tracing_subscriber::fmt::layer()
    .with_ansi(cfg!(debug_assertions))
    .with_span_events(tracing_subscriber::fmt::format::FmtSpan::ACTIVE)
    .with_writer(std::io::stderr);

  tracing_subscriber::registry()
    .with(logging_filter)
    .with(file_layer)
    .with(stderr_layer)
    .init();
  std::panic::set_hook(Box::new(tracing_panic::panic_hook));

  Ok(())
}

#[must_use]
pub fn default_env_filter() -> tracing_subscriber::EnvFilter {
  tracing_subscriber::EnvFilter::try_from_env("EMBROIDERLY_LOG").unwrap_or_else(|_| {
    let directives = [
      format!("{DEFAULT_LOG_LEVEL}"),
      format!("embroiderly={APPLICATION_LOG_LEVEL}"),
      format!("embroiderly_wasm={APPLICATION_LOG_LEVEL}"),
      format!("xsp_parsers={APPLICATION_LOG_LEVEL}"),
      format!("webview={APPLICATION_LOG_LEVEL}"),
    ];
    tracing_subscriber::EnvFilter::new(directives.join(","))
  })
}
