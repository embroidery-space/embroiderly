use std::io::{self, Read};

use byteorder::{LittleEndian, ReadBytesExt as _};

use crate::utils::read::ReadXspExt as _;
use crate::xspro::schemas::palette::PaletteItem;

const PALETTE_BRAND_LENGTH: usize = 28;
const COLOR_NUMBER_LENGTH: usize = 28;

/// Parses an `XSPro` Platinum palette from raw bytes.
/// `file_name` is used as the palette brand name when present (overrides the brand embedded in the file).
#[tracing::instrument(name = "parse_xspro_palette_bytes", skip(data))]
pub fn parse_palette_from_bytes(data: &[u8]) -> io::Result<Vec<PaletteItem>> {
  let mut cursor = std::io::Cursor::new(data);

  let brand = cursor.read_cstring(PALETTE_BRAND_LENGTH)?;
  let palette_size = cursor.read_u16::<LittleEndian>()? as usize;

  let mut palette = Vec::with_capacity(palette_size);
  for _ in 0..palette_size {
    palette.push(parse_palette_item(&mut cursor, brand.clone())?);
  }

  Ok(palette)
}

#[tracing::instrument(name = "parse_xspro_palette", level = "debug", skip_all)]
pub fn parse_palette<P: AsRef<std::path::Path>>(file_path: P) -> io::Result<Vec<PaletteItem>> {
  let data = std::fs::read(file_path)?;
  parse_palette_from_bytes(&data)
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
