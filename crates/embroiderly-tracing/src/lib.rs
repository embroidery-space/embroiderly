use tracing_subscriber::layer::SubscriberExt as _;
use tracing_subscriber::util::SubscriberInitExt as _;

pub const WEBVIEW_TARGET: &str = "webview";

pub const EMBROIDERLY_LOGS_DIR_ENV_VAR: &str = "EMBROIDERLY_LOGS_DIR";

#[cfg(debug_assertions)]
const APPLICATION_LOG_LEVEL: tracing::Level = tracing::Level::TRACE;
#[cfg(not(debug_assertions))]
const APPLICATION_LOG_LEVEL: tracing::Level = tracing::Level::DEBUG;

pub fn init(binary_name: &str, logs_dir: std::path::PathBuf) -> anyhow::Result<()> {
  if !logs_dir.exists() {
    std::fs::create_dir_all(&logs_dir)?;
  }

  let logging_filter = tracing_subscriber::EnvFilter::builder()
    .with_default_directive(format!("{binary_name}={APPLICATION_LOG_LEVEL}").parse().unwrap())
    .with_env_var(format!("{}_LOG", binary_name.to_uppercase()))
    .from_env_lossy();

  let stderr_layer = tracing_subscriber::fmt::layer().compact().with_writer(std::io::stderr);
  let file_layer = tracing_subscriber::fmt::layer().compact().with_writer(
    std::fs::OpenOptions::new()
      .write(true)
      .create(true)
      .truncate(true)
      .open(logs_dir.join(format!("{binary_name}.log")))?,
  );

  tracing_subscriber::registry()
    .with(logging_filter)
    .with(stderr_layer)
    .with(file_layer)
    .init();
  std::panic::set_hook(Box::new(tracing_panic::panic_hook));

  Ok(())
}
