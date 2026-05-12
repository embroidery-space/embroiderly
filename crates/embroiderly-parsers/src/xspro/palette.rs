use std::io::{self, Read};

use byteorder::{LittleEndian, ReadBytesExt as _};
use embroiderly_pattern::BrandPaletteItem;

use crate::utils::read::ReadXspExt as _;

const PALETTE_BRAND_LENGTH: usize = 28;
const COLOR_NUMBER_LENGTH: usize = 28;

#[tracing::instrument(name = "parse_xspro_palette", skip_all)]
pub fn parse_palette(data: &[u8]) -> anyhow::Result<Vec<BrandPaletteItem>> {
  let mut cursor = std::io::Cursor::new(data);

  let brand = cursor.read_cstring(PALETTE_BRAND_LENGTH)?;
  let palette_size = cursor.read_u16::<LittleEndian>()? as usize;

  let mut palette = Vec::with_capacity(palette_size);
  for _ in 0..palette_size {
    palette.push(parse_palette_item(&mut cursor, brand.clone())?);
  }

  Ok(palette)
}

fn parse_palette_item<R: Read>(reader: &mut R, brand: String) -> io::Result<BrandPaletteItem> {
  let number_and_name = reader.read_cstring(COLOR_NUMBER_LENGTH)?;
  let (number, name) = number_and_name.split_once(' ').unwrap_or(("", &number_and_name));
  Ok(BrandPaletteItem {
    brand,
    number: number.trim().to_owned(),
    name: name.trim().to_owned(),
    color: reader.read_hex_color()?,
    blends: None,
  })
}
