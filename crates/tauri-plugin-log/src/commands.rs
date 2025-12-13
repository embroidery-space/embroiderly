#[tauri::command]
pub fn log(level: String, message: String, location: Option<String>) {
  match std::str::FromStr::from_str(&level) {
    Ok(tracing::Level::ERROR) => tracing::error!(target: "webview", location, message),
    Ok(tracing::Level::WARN) => tracing::warn!(target: "webview", location, message),
    Ok(tracing::Level::INFO) => tracing::info!(target: "webview", location, message),
    Ok(tracing::Level::DEBUG) => tracing::debug!(target: "webview", location, message),
    Ok(tracing::Level::TRACE) => tracing::trace!(target: "webview", location, message),
    Err(_) => {}
  }
}
