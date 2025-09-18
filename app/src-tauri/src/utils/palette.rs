pub fn is_palette_file<P: AsRef<std::path::Path>>(path: P) -> bool {
  let path = path.as_ref();
  if let Some(extension) = path.extension() {
    matches!(
      extension.to_ascii_lowercase().to_str(),
      Some("master") | Some("user") | Some("threads") | Some("rng")
    )
  } else {
    false
  }
}
