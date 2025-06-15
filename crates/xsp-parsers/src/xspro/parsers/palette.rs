use std::io::{self, Read};

use byteorder::{LittleEndian, ReadBytesExt};

use crate::utils::read::ReadXspExt as _;
use crate::xspro::schemas::palette::PaletteItem;

const PALETTE_BRAND_LENGTH: usize = 28;
const COLOR_NUMBER_LENGTH: usize = 28;

pub fn parse_palette<P: AsRef<std::path::Path>>(file_path: P) -> io::Result<Vec<PaletteItem>> {
  log::debug!("Parsing XSPro's palette file");

  let file_path = file_path.as_ref();
  let filename = file_path.file_name().map(|s| s.to_string_lossy().to_string());

  let buf = std::fs::read(file_path)?;
  let mut cursor = std::io::Cursor::new(buf);

  let brand = cursor.read_cstring(PALETTE_BRAND_LENGTH)?;
  let palette_size = cursor.read_u16::<LittleEndian>()? as usize;

  let mut palette = Vec::with_capacity(palette_size);
  for _ in 0..palette_size {
    palette.push(parse_palette_item(
      &mut cursor,
      filename.as_ref().unwrap_or(&brand).clone(),
    )?);
  }

  log::debug!("Palette parsed");
  Ok(palette)
}

fn parse_palette_item<R: Read>(reader: &mut R, brand: String) -> io::Result<PaletteItem> {
  let number_and_name = reader.read_cstring(COLOR_NUMBER_LENGTH)?;
  let (number, name) = number_and_name.split_once(' ').unwrap_or(("", &number_and_name));
  Ok(PaletteItem {
    brand,
    number: number.trim().to_owned(),
    name: name.trim().to_owned(),
    color: reader.read_hex_color()?,
  })
}
