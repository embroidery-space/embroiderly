use std::io::{Read as _, Seek as _};

use byteorder::{LittleEndian, ReadBytesExt as _};
use embroiderly_pattern::{Blend, BrandPaletteItem};

use super::xsd::read_palette_item;

const MASTER_PALETTE_MAGIC: [u8; 4] = [0x31, 0x54, 0x76, 0x98];

/// Parses a Pattern Maker palette from raw bytes.
/// `file_name` must include the extension (`.master` or `.user`) to determine the palette type.
#[tracing::instrument(name = "parse_pmaker_palette", level = "debug", skip_all)]
pub fn parse_palette(data: &[u8]) -> anyhow::Result<Vec<BrandPaletteItem>> {
  let mut cursor = std::io::Cursor::new(data);

  let magic = {
    let mut buf = [0; 4];
    cursor.read_exact(&mut buf)?;
    buf
  };
  let is_master_palette = magic == MASTER_PALETTE_MAGIC;

  tracing::debug!("magic: {magic:?}; is master: {is_master_palette}");

  let palette_size: usize = cursor.read_u16::<LittleEndian>()?.into();
  if is_master_palette {
    cursor.seek_relative(2)?;
  }

  let mut palette = Vec::with_capacity(palette_size);
  for _ in 0..palette_size {
    let item = read_palette_item(&mut cursor)?;
    palette.push(BrandPaletteItem {
      brand: item.brand,
      number: item.number,
      name: item.name,
      color: item.color,
      blends: item.blends.map(|blends| {
        blends
          .into_iter()
          .map(|b| Blend {
            brand: b.brand,
            number: b.number,
          })
          .collect()
      }),
    });
  }

  Ok(palette)
}
