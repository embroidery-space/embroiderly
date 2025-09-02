pub const WEBVIEW_TARGET: &str = "webview";
pub const EMBROIDERLY_LOG_DIR_ENV_VAR: &str = "EMBROIDERLY_LOG_DIR";

pub const DEFAULT_LOG_LEVEL: log::Level = log::Level::Info;
#[cfg(debug_assertions)]
pub const APPLICATION_LOG_LEVEL: log::Level = log::Level::Trace;
#[cfg(not(debug_assertions))]
pub const APPLICATION_LOG_LEVEL: log::Level = log::Level::Debug;

/// Initializes the logger for the main application.
pub fn init_main_logger(log_dir: std::path::PathBuf) -> anyhow::Result<fern::Dispatch> {
  if !log_dir.exists() {
    std::fs::create_dir_all(&log_dir)?;
  }

  let log_file_path = log_dir.join("embroiderly.log");
  let dispatch = create_base_dispatch(log_file_path)?;

  Ok(dispatch)
}

/// Initialize logger from environment variables (used by sidecars) and return the dispatcher.
pub fn init_sidecar_logger(binary_name: &str) -> anyhow::Result<fern::Dispatch> {
  let log_dir = std::path::PathBuf::from(
    std::env::var(EMBROIDERLY_LOG_DIR_ENV_VAR)
      .expect("The environment variable EMBROIDERLY_LOG_DIR must be set for the sidecar process!"),
  );

  if !log_dir.exists() {
    std::fs::create_dir_all(&log_dir)?;
  }

  let log_file_path = log_dir.join(format!("{binary_name}.log"));
  let dispatch = create_base_dispatch(log_file_path)?;

  Ok(dispatch)
}

/// Create a base dispatch configuration shared between main app and sidecars.
fn create_base_dispatch(log_file_path: std::path::PathBuf) -> anyhow::Result<fern::Dispatch> {
  log_panics::init();

  #[allow(unused_mut)]
  let mut dispatch = fern::Dispatch::new()
    .format(|out, message, record| {
      // The format is the same as a built-in ISO 8601 except for formatting.
      let format =
        time::macros::format_description!("[[[year]-[month]-[day]][[[hour]:[minute]:[second].[subsecond digits:9]]");
      out.finish(format_args!(
        "{}[{}][{}] {}",
        time::OffsetDateTime::now_utc().format(&format).unwrap(),
        record.target(),
        record.level(),
        message
      ))
    })
    .level(DEFAULT_LOG_LEVEL.to_level_filter())
    .chain(fern::log_file(&log_file_path)?);

  // In debug mode, also log to stderr.
  #[cfg(debug_assertions)]
  {
    dispatch = dispatch.chain(fern::Dispatch::new().chain(std::io::stderr()));
  }

  Ok(dispatch)
}
