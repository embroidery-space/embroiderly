use embroiderly_pattern::BrandPaletteItem;

#[cfg(test)]
#[path = "palette.test.rs"]
mod tests;

#[tracing::instrument(name = "parse_ursa_palette", level = "debug", skip_all)]
pub fn parse_palette(data: &[u8]) -> anyhow::Result<Vec<BrandPaletteItem>> {
  let content = std::str::from_utf8(data).map_err(|e| anyhow::anyhow!(e))?;

  let mut palette = Vec::new();
  for line in content.replace("\r\n", "\n").replace("\r", "\n").lines() {
    if let Some(palitem) = parse_palette_item(line) {
      palette.push(palitem);
    }
  }

  Ok(palette)
}

fn parse_palette_item(line: &str) -> Option<BrandPaletteItem> {
  let parts: Vec<String> = line.split(',').map(|s| s.replace('"', "")).collect();
  if parts.len() < 3 || parts[0] == "STOP" {
    return None;
  }

  let (brand, number) = parts[0].rsplit_once(' ').unwrap_or(("", &parts[0]));
  let color = parts[2].trim().parse::<u32>().ok()?;

  Some(BrandPaletteItem {
    brand: brand.trim().to_owned(),
    number: number.trim().to_owned(),
    name: parts[1].trim().to_owned(),
    color: format!("{color:06X}"),
    blends: None,
  })
}
