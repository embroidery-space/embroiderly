use crate::ursa::schemas::palette::PaletteItem;

#[cfg(test)]
#[path = "palette.test.rs"]
mod tests;

pub fn parse_palette<P: AsRef<std::path::Path>>(file_path: P) -> std::io::Result<Vec<PaletteItem>> {
  log::debug!("Parsing Ursa's palette file");
  let content = std::fs::read_to_string(file_path.as_ref())?;

  let mut palette = Vec::new();
  for line in content.replace("\r\n", "\n").replace("\r", "\n").lines() {
    if let Some(palitem) = parse_palette_item(line) {
      palette.push(palitem);
    }
  }

  log::debug!("Palette parsed");
  Ok(palette)
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
    color: format!("{:06X}", color),
  })
}
