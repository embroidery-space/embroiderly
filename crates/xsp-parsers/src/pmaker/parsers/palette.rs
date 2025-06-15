use byteorder::{LittleEndian, ReadBytesExt};

use crate::pmaker::PaletteItem;
use crate::pmaker::error::{PmakerError, Result};
use crate::pmaker::parsers::xsd::read_palette_item;

enum PatternMakerPalette {
  Master,
  User,
}

impl TryFrom<Option<&std::ffi::OsStr>> for PatternMakerPalette {
  type Error = PmakerError;

  fn try_from(value: Option<&std::ffi::OsStr>) -> Result<Self> {
    match value {
      Some(os_str) => match os_str.to_str() {
        Some("Master") | Some("master") => Ok(PatternMakerPalette::Master),
        Some("User") | Some("user") => Ok(PatternMakerPalette::User),
        _ => Err(PmakerError::InvalidPaletteType(os_str.to_string_lossy().to_string())),
      },
      None => Err(PmakerError::InvalidPaletteType("No palette type provided".into())),
    }
  }
}

pub fn parse_palette<P: AsRef<std::path::Path>>(file_path: P) -> Result<Vec<PaletteItem>> {
  log::debug!("Parsing Pattern Maker's palette");
  let file_path = file_path.as_ref();

  let buf = std::fs::read(file_path)?;
  let mut cursor = std::io::Cursor::new(buf);

  cursor.set_position(0x04);
  let palette_size: usize = cursor.read_u16::<LittleEndian>()?.into();

  match PatternMakerPalette::try_from(file_path.extension())? {
    PatternMakerPalette::Master => {
      log::debug!("Parsing master palette");
      cursor.set_position(0x08);
    }
    PatternMakerPalette::User => {
      log::debug!("Parsing user palette");
      cursor.set_position(0x06);
    }
  }

  let mut palette = Vec::with_capacity(palette_size);
  for _ in 0..palette_size {
    palette.push(read_palette_item(&mut cursor)?)
  }

  log::debug!("Palette parsed");
  Ok(palette)
}
