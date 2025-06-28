use crate::ursa::schemas::palette::PaletteItem;

#[cfg(test)]
#[path = "palette.test.rs"]
mod tests;

pub fn parse_palette<P: AsRef<std::path::Path>>(file_path: P) -> std::io::Result<Vec<PaletteItem>> {
  log::debug!("Parsing Ursa's palette file");
  let content = std::fs::read_to_string(file_path.as_ref())?;

  let mut palette_items = Vec::new();
  for line in content.replace("\r\n", "\n").replace("\r", "\n").lines() {
    if let Ok(palitem) = parse_palette_item(line) {
      if let Some(palitem) = palitem {
        palette_items.push(palitem);
      }
    } else {
      log::warn!("Failed to parse line: {line}");
    }
  }

  log::debug!("Palette parsed");
  Ok(palette_items)
}

fn parse_palette_item(line: &str) -> std::result::Result<Option<PaletteItem>, std::num::ParseIntError> {
  let parts: Vec<String> = line.split(',').map(|s| s.replace('"', "")).collect();
  if parts.len() < 3 || parts[0] == "STOP" {
    return Ok(None);
  }

  let (brand, number) = parts[0].rsplit_once(' ').unwrap_or(("", &parts[0]));
  Ok(Some(PaletteItem {
    brand: brand.trim().to_owned(),
    number: number.trim().to_owned(),
    name: parts[1].trim().to_owned(),
    color: format!("{:06X}", parts[2].trim().parse::<u32>()?),
  }))
}
