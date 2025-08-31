use embroiderly_logger::WEBVIEW_TARGET;

#[tauri::command]
pub async fn log(level: String, message: String, location: Option<String>) {
  let level = std::str::FromStr::from_str(&level).unwrap();
  let target = if let Some(location) = location {
    format!("{WEBVIEW_TARGET}:{location}")
  } else {
    WEBVIEW_TARGET.to_string()
  };

  let mut builder = log::RecordBuilder::new();
  builder.level(level).target(&target);

  log::logger().log(&builder.args(format_args!("{message}")).build());
}
