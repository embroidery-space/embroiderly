pub fn is_font_file<P: AsRef<std::path::Path>>(path: P) -> bool {
  let path = path.as_ref();
  if let Some(extension) = path.extension() {
    matches!(extension.to_ascii_lowercase().to_str(), Some("ttf") | Some("otf"))
  } else {
    false
  }
}
