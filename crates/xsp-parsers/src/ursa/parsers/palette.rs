use crate::ursa::schemas::palette::PaletteItem;

#[cfg(test)]
#[path = "palette.test.rs"]
mod tests;

/// Parses a Ursa/WinStitch palette from raw UTF-8 bytes.
#[tracing::instrument(name = "parse_ursa_palette_bytes", level = "debug", skip(data))]
pub fn parse_palette_from_bytes(data: &[u8]) -> std::io::Result<Vec<PaletteItem>> {
  let content = std::str::from_utf8(data).map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;

  let mut palette = Vec::new();
  for line in content.replace("\r\n", "\n").replace("\r", "\n").lines() {
    if let Some(palitem) = parse_palette_item(line) {
      palette.push(palitem);
    }
  }

  Ok(palette)
}

#[tracing::instrument(name = "parse_ursa_palette", level = "debug", skip_all)]
pub fn parse_palette<P: AsRef<std::path::Path>>(file_path: P) -> std::io::Result<Vec<PaletteItem>> {
  let data = std::fs::read(file_path.as_ref())?;
  parse_palette_from_bytes(&data)
}

fn parse_palette_item(line: &str) -> Option<PaletteItem> {
  let parts: Vec<String> = line.split(',').map(|s| s.replace('"', "")).collect();
  if parts.len() < 3 || parts[0] == "STOP" {
    return None;
  }

  let (brand, number) = parts[0].rsplit_once(' ').unwrap_or(("", &parts[0]));
  let color = parts[2].trim().parse::<u32>().ok()?;

  Some(PaletteItem {
    brand: brand.trim().to_owned(),
    number: number.trim().to_owned(),
    name: parts[1].trim().to_owned(),
    color: format!("{color:06X}"),
  })
}
