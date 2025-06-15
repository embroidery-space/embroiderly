//! A parser for the proprietary XSD pattern format.
//!
//! The specification of this format was obtained by reverse engineering several applications, including Pattern Maker.
//! Therefore, it is rather incomplete, but it contains all the knowledge to be able to extract enough data to display the pattern.

use std::io::{self, Read, Seek, SeekFrom};
use std::sync::LazyLock;

use byteorder::{LittleEndian, ReadBytesExt};

use crate::pmaker::error::{PmakerError, Result};
use crate::pmaker::schemas::xsd::*;
use crate::utils::read::ReadXspExt as _;

#[cfg(test)]
#[path = "xsd.test.rs"]
mod tests;

static PM_THREAD_BRANDS: LazyLock<std::collections::HashMap<u8, String>> = LazyLock::new(|| {
  let content = include_str!("../../resources/pmaker_thread_brands.txt");
  let entries = content.lines().map(|line| {
    let mut parts = line.split(':').map(|part| part.trim());
    let id = parts.next().unwrap().parse().unwrap();
    let name = parts.next().unwrap().to_owned();
    (id, name)
  });
  entries.collect()
});

const VALID_SIGNATURE: u16 = 0x0510;

const COLOR_NUMBER_LENGTH: usize = 10;
const COLOR_NAME_LENGTH: usize = 40;
/// Pattern Maker limits blends up to 4 colors. The minimum is 2 if they are present.
const BLEND_COLORS_NUMBER: usize = 4;

const PATTERN_NAME_LENGTH: usize = 40;
const AUTHOR_NAME_LENGTH: usize = 40;
const COMPANY_NAME_LENGTH: usize = 40;
const COPYRIGHT_LENGTH: usize = 200;
const PATTERN_NOTES_LENGTH: usize = 2048;

const FABRIC_COLOR_NAME_LENGTH: usize = 40;
const FABRIC_KIND_NAME_LENGTH: usize = 40;

const FONT_NAME_LENGTH: usize = 32;

/// It is the maximum size of the palette.
const FORMAT_LENGTH: usize = 240;

/// Full, petite, half, quarter, back, straight, french knot, bead, special.
const STITCH_TYPES_NUMBER: usize = 9;

const PAGE_HEADER_AND_FOOTER_LENGTH: usize = 119;

const SPECIAL_STITCH_NAME_LENGTH: usize = 255;

pub fn parse_pattern<P: AsRef<std::path::Path>>(file_path: P) -> Result<Pattern> {
  log::debug!("Parsing XSD pattern");

  let buf = std::fs::read(file_path.as_ref())?;
  let mut cursor = std::io::Cursor::new(buf);

  let signature = read_signature(&mut cursor)?;
  if signature != VALID_SIGNATURE {
    return Err(PmakerError::InvalidSignature {
      expected: VALID_SIGNATURE,
      found: signature,
    });
  }
  cursor.seek_relative(4)?;

  let version = read_pmaker_version(&mut cursor)?;
  log::debug!("Pattern Maker version: {version}",);

  cursor.seek_relative(727)?; // Skip the unknown data.

  let pattern_width = cursor.read_u16::<LittleEndian>()?;
  let pattern_height = cursor.read_u16::<LittleEndian>()?;

  let total_stitches_count = (pattern_width as usize) * (pattern_height as usize);
  let small_stitches_count = cursor.read_u32::<LittleEndian>()? as usize;
  let joints_count = cursor.read_u16::<LittleEndian>()?;

  let stitches_per_inch = (
    cursor.read_u16::<LittleEndian>()? as u8,
    cursor.read_u16::<LittleEndian>()? as u8,
  );
  cursor.seek_relative(6)?;

  let palette = read_palette(&mut cursor)?;
  let formats = read_formats(&mut cursor, palette.len())?;
  let symbols = read_symbols(&mut cursor, palette.len())?;

  let (pattern_settings, print_settings) = read_pattern_and_print_settings(&mut cursor)?;

  let grid = read_grid(&mut cursor)?;

  let fabric_color_name = cursor.read_cstring(FABRIC_COLOR_NAME_LENGTH)?;
  let fabric_color = cursor.read_hex_color()?;
  cursor.seek_relative(65)?;
  let pattern_info = read_pattern_info(&mut cursor)?;
  cursor.seek_relative(6)?;
  let fabric_kind_name = cursor.read_cstring(FABRIC_KIND_NAME_LENGTH)?;
  cursor.seek_relative(206)?;

  let stitch_settings = read_stitch_settings(&mut cursor)?;
  let symbol_settings = read_symbol_settings(&mut cursor)?;

  cursor.seek_relative(16412)?; // Skip library info.
  cursor.seek_relative(512)?; // Skip machine export info.

  let (fullstitches, partstitches) = read_stitches(
    &mut cursor,
    pattern_width as usize,
    total_stitches_count,
    small_stitches_count,
  )?;

  let special_stitch_models = read_special_stitch_models(&mut cursor)?;

  let (linestitches, nodestitches, specialstitches, _curvedstitches) = read_joints(&mut cursor, joints_count)?;

  log::debug!("Pattern parsed");
  Ok(Pattern {
    info: pattern_info,
    fabric: Fabric {
      width: pattern_width,
      height: pattern_height,
      kind: fabric_kind_name,
      name: fabric_color_name,
      color: fabric_color,
      stitches_per_inch,
    },
    palette,
    formats,
    symbols,
    fullstitches,
    partstitches,
    nodestitches,
    linestitches,
    specialstitches,
    special_stitch_models,
    grid,
    pattern_settings,
    stitch_settings,
    symbol_settings,
    print_settings,
  })
}

fn read_signature<R: Read>(reader: &mut R) -> io::Result<u16> {
  let signature = reader.read_u16::<LittleEndian>()?;
  Ok(signature)
}

fn read_pmaker_version<R: Read>(reader: &mut R) -> io::Result<PatternMakerVersion> {
  Ok(PatternMakerVersion((
    reader.read_u16::<LittleEndian>()?,
    reader.read_u16::<LittleEndian>()?,
    reader.read_u16::<LittleEndian>()?,
    reader.read_u16::<LittleEndian>()?,
  )))
}

struct PatternMakerVersion((u16, u16, u16, u16));

impl std::fmt::Display for PatternMakerVersion {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}.{}.{}.{}", self.0.1, self.0.0, self.0.3, self.0.2)
  }
}

/// Reads the color palette of the pattern.
fn read_palette<R: Read + Seek>(reader: &mut R) -> io::Result<Vec<PaletteItem>> {
  log::trace!("Reading palette");

  let palette_size: usize = reader.read_u16::<LittleEndian>()?.into();
  let mut palette = Vec::with_capacity(palette_size);

  for _ in 0..palette_size {
    palette.push(read_palette_item(reader)?);
  }

  reader.seek_relative((palette_size * 2) as i64)?; // Skip palette item's position.
  skip_palette_items_notes(reader, palette_size)?;

  for pi in palette.iter_mut() {
    pi.strands = Some(read_palette_item_strands(reader)?);
  }

  Ok(palette)
}

// TODO: Implement reading the palette item notes.
/// Reads a single palette item.
pub fn read_palette_item<R: Read + Seek>(reader: &mut R) -> io::Result<PaletteItem> {
  /// Reads the blend colors of the palette item.
  fn read_blends<R: Read + Seek>(reader: &mut R) -> io::Result<Option<Vec<Blend>>> {
    let blends_count: usize = reader.read_u16::<LittleEndian>()?.into();
    let mut blends: Vec<Blend> = Vec::with_capacity(blends_count);

    // Read blends.
    for _ in 0..blends_count {
      let brand_id = reader.read_u8()?;
      blends.push(Blend {
        brand: PM_THREAD_BRANDS
          .get(&brand_id)
          .unwrap_or(&String::from("Unknown"))
          .to_owned(),
        number: reader.read_cstring(COLOR_NUMBER_LENGTH)?,
        strands: 0, // The actual value will be set when calling `read_blend_strands`.
      });
    }
    reader.seek_relative(((BLEND_COLORS_NUMBER - blends_count) * 12) as i64)?; // Skip empty blends.

    // Read blend's strands.
    for blend in blends.iter_mut() {
      blend.strands = reader.read_u8()?;
    }
    reader.seek_relative((BLEND_COLORS_NUMBER - blends_count) as i64)?; // Skip empty blend's strands.

    Ok(if blends.is_empty() { None } else { Some(blends) })
  }

  reader.seek_relative(2)?;
  let brand_id = reader.read_u8()?;
  let brand = PM_THREAD_BRANDS
    .get(&brand_id)
    .unwrap_or(&String::from("Unknown"))
    .to_owned();
  let number = reader.read_cstring(COLOR_NUMBER_LENGTH)?;
  let name = reader.read_cstring(COLOR_NAME_LENGTH)?;
  let color = reader.read_hex_color()?;
  reader.seek_relative(1)?;
  let blends = read_blends(reader)?;
  let is_bead = reader.read_u32::<LittleEndian>()? == 1;
  let bead = if is_bead {
    Some(Bead {
      length: reader.read_u16::<LittleEndian>()? as f32 / 10.0,
      diameter: reader.read_u16::<LittleEndian>()? as f32 / 10.0,
    })
  } else {
    // Prevent reading a trash data.
    reader.seek_relative(4)?;
    None
  };
  reader.seek_relative(2)?;

  Ok(PaletteItem {
    brand,
    name,
    number,
    color,
    blends,
    bead,
    strands: None,
  })
}

/// Skips the notes of the palette items.
fn skip_palette_items_notes<R: Read + Seek>(reader: &mut R, palette_size: usize) -> io::Result<()> {
  for _ in 0..palette_size {
    for _ in 0..STITCH_TYPES_NUMBER {
      let note_length = reader.read_u16::<LittleEndian>()?;
      reader.seek_relative(note_length.into())?;
    }
  }
  Ok(())
}

fn read_palette_item_strands<R: Read>(reader: &mut R) -> io::Result<StitchStrands<Option<u8>>> {
  fn map_strands(value: u16) -> Option<u8> {
    if value == 0 { None } else { Some(value as u8) }
  }

  // Order is important!
  Ok(StitchStrands {
    full: map_strands(reader.read_u16::<LittleEndian>()?),
    half: map_strands(reader.read_u16::<LittleEndian>()?),
    quarter: map_strands(reader.read_u16::<LittleEndian>()?),
    back: map_strands(reader.read_u16::<LittleEndian>()?),
    french_knot: map_strands(reader.read_u16::<LittleEndian>()?),
    petite: map_strands(reader.read_u16::<LittleEndian>()?),
    special: map_strands(reader.read_u16::<LittleEndian>()?),
    straight: map_strands(reader.read_u16::<LittleEndian>()?),
  })
}

fn read_formats<R: Read + Seek>(reader: &mut R, palette_size: usize) -> io::Result<Vec<Formats>> {
  log::trace!("Reading formats");

  let symbol_formats = read_symbol_formats(reader, palette_size)?;
  let back_stitch_formats = read_line_formats(reader, palette_size)?;
  reader.seek_relative((FORMAT_LENGTH * 4) as i64)?; // Skip unknown formats.
  let special_stitch_formats = read_line_formats(reader, palette_size)?;
  let straight_stitch_formats = read_line_formats(reader, palette_size)?;
  let french_knot_formats = read_node_formats(reader, palette_size)?;
  let bead_formats = read_node_formats(reader, palette_size)?;
  let font_formats = read_font_formats(reader, palette_size)?;

  let formats = itertools::izip!(
    symbol_formats,
    back_stitch_formats,
    straight_stitch_formats,
    french_knot_formats,
    bead_formats,
    special_stitch_formats,
    font_formats,
  )
  .map(
    |(symbol, back_stitch, straight_stitch, french_knot, bead, special_stitch, font)| Formats {
      symbol,
      back_stitch,
      straight_stitch,
      french_knot,
      bead,
      special_stitch,
      font,
    },
  )
  .collect();

  Ok(formats)
}

fn read_symbol_formats<R: Read + Seek>(reader: &mut R, palette_size: usize) -> io::Result<Vec<SymbolFormat>> {
  let mut formats = Vec::with_capacity(palette_size);
  for _ in 0..palette_size {
    let use_alt_bg_color = reader.read_u16::<LittleEndian>()? == 1;
    let bg_color = reader.read_hex_color()?;
    reader.seek_relative(1)?;
    let fg_color = reader.read_hex_color()?;
    reader.seek_relative(1)?;
    formats.push(SymbolFormat {
      use_alt_bg_color,
      bg_color,
      fg_color,
    });
  }
  reader.seek_relative(((FORMAT_LENGTH - palette_size) * 10) as i64)?;
  Ok(formats)
}

fn read_line_formats<R: Read + Seek>(reader: &mut R, palette_size: usize) -> io::Result<Vec<LineStitchFormat>> {
  let mut formats = Vec::with_capacity(palette_size);
  for _ in 0..palette_size {
    let use_alt_color = reader.read_u16::<LittleEndian>()? == 1;
    let color = reader.read_hex_color()?;
    reader.seek_relative(1)?;
    let style = reader.read_u16::<LittleEndian>()?;
    let thickness = reader.read_u16::<LittleEndian>()? as f32 / 10.0;
    formats.push(LineStitchFormat {
      use_alt_color,
      color,
      style,
      thickness,
    });
  }
  reader.seek_relative(((FORMAT_LENGTH - palette_size) * 10) as i64)?;
  Ok(formats)
}

fn read_node_formats<R: Read + Seek>(reader: &mut R, palette_size: usize) -> io::Result<Vec<NodeStitchFormat>> {
  let mut formats = Vec::with_capacity(palette_size);
  for _ in 0..palette_size {
    let use_dot_style = reader.read_u16::<LittleEndian>()? == 1;
    let color = reader.read_hex_color()?;
    reader.seek_relative(1)?;
    let use_alt_color = reader.read_u16::<LittleEndian>()? == 1;
    let thickness = reader.read_u16::<LittleEndian>()? as f32 / 10.0;
    formats.push(NodeStitchFormat {
      use_dot_style,
      color,
      use_alt_color,
      thickness,
    });
  }
  reader.seek_relative(((FORMAT_LENGTH - palette_size) * 10) as i64)?;
  Ok(formats)
}

fn read_font_formats<R: Read + Seek>(reader: &mut R, palette_size: usize) -> io::Result<Vec<FontFormat>> {
  let mut formats = Vec::with_capacity(palette_size);
  for _ in 0..palette_size {
    let font_name = reader.read_cstring(FONT_NAME_LENGTH)?;
    let font_name = if font_name == "default" { None } else { Some(font_name) };
    reader.seek_relative(2)?;
    let bold = reader.read_u16::<LittleEndian>()? == 700;
    let italic = reader.read_u8()? == 1;
    reader.seek_relative(11)?;
    let stitch_size = reader.read_u16::<LittleEndian>()? as u8;
    let small_stitch_size = reader.read_u16::<LittleEndian>()? as u8;
    formats.push(FontFormat {
      font_name,
      bold,
      italic,
      stitch_size,
      small_stitch_size,
    });
  }
  reader.seek_relative(((FORMAT_LENGTH - palette_size) * 53) as i64)?;
  Ok(formats)
}

fn read_symbols<R: Read>(reader: &mut R, palette_size: usize) -> io::Result<Vec<Symbols>> {
  log::trace!("Reading symbols");

  fn map_symbol(value: u16) -> Option<u16> {
    if value == 0xFFFF { None } else { Some(value) }
  }

  let mut symbols = Vec::with_capacity(palette_size);
  for _ in 0..palette_size {
    symbols.push(Symbols {
      full: map_symbol(reader.read_u16::<LittleEndian>()?),
      petite: map_symbol(reader.read_u16::<LittleEndian>()?),
      half: map_symbol(reader.read_u16::<LittleEndian>()?),
      quarter: map_symbol(reader.read_u16::<LittleEndian>()?),
      french_knot: map_symbol(reader.read_u16::<LittleEndian>()?),
      bead: map_symbol(reader.read_u16::<LittleEndian>()?),
    });
  }

  Ok(symbols)
}

fn read_pattern_and_print_settings<R: Read + Seek>(reader: &mut R) -> io::Result<(PatternSettings, PrintSettings)> {
  log::trace!("Reading pattern and print settings");

  let default_stitch_font = reader.read_cstring(FONT_NAME_LENGTH)?;
  reader.seek_relative(20)?;

  let font = Font {
    name: reader.read_cstring(FONT_NAME_LENGTH)?,
    size: reader.read_u16::<LittleEndian>()?,
    weight: reader.read_u16::<LittleEndian>()?,
    italic: reader.read_u16::<LittleEndian>()? == 1,
  };
  reader.seek_relative(10)?;

  let view = reader.read_u16::<LittleEndian>()?;
  let zoom = reader.read_u16::<LittleEndian>()?;

  let show_grid = reader.read_u16::<LittleEndian>()? == 1;
  let show_rulers = reader.read_u16::<LittleEndian>()? == 1;
  let show_centering_marks = reader.read_u16::<LittleEndian>()? == 1;
  let show_fabric_colors_with_symbols = reader.read_u16::<LittleEndian>()? == 1;
  reader.seek_relative(4)?;
  let gaps_between_stitches = reader.read_u16::<LittleEndian>()? == 1;

  let page_header = reader.read_cstring(PAGE_HEADER_AND_FOOTER_LENGTH)?;
  let page_footer = reader.read_cstring(PAGE_HEADER_AND_FOOTER_LENGTH)?;
  let page_margins = PageMargins {
    left: reader.read_u16::<LittleEndian>()? as f32 / 100.0,
    right: reader.read_u16::<LittleEndian>()? as f32 / 100.0,
    top: reader.read_u16::<LittleEndian>()? as f32 / 100.0,
    bottom: reader.read_u16::<LittleEndian>()? as f32 / 100.0,
    header: reader.read_u16::<LittleEndian>()? as f32 / 100.0,
    footer: reader.read_u16::<LittleEndian>()? as f32 / 100.0,
  };
  let show_page_numbers = reader.read_u16::<LittleEndian>()? == 1;
  let show_adjacent_page_numbers = reader.read_u16::<LittleEndian>()? == 1;
  let center_chart_on_pages = reader.read_u16::<LittleEndian>()? == 1;
  reader.seek_relative(2)?;

  Ok((
    PatternSettings {
      default_stitch_font,
      view,
      zoom,
      show_grid,
      show_rulers,
      show_centering_marks,
      show_fabric_colors_with_symbols,
      gaps_between_stitches,
    },
    PrintSettings {
      font,
      header: page_header,
      footer: page_footer,
      margins: page_margins,
      show_page_numbers,
      show_adjacent_page_numbers,
      center_chart_on_pages,
    },
  ))
}

fn read_grid<R: Read + Seek>(reader: &mut R) -> io::Result<Grid> {
  log::trace!("Reading grid");

  fn read_grid_line_style<R: Read + Seek>(reader: &mut R) -> io::Result<GridLineStyle> {
    let thickness = (reader.read_u16::<LittleEndian>()? * 72) as f32 / 1000.0; // Convert to points.
    reader.seek_relative(2)?;
    let color = reader.read_hex_color()?;
    reader.seek_relative(3)?;
    Ok(GridLineStyle { color, thickness })
  }

  let major_lines_interval = reader.read_u16::<LittleEndian>()?;
  reader.seek_relative(2)?;
  let minor_screen_lines = read_grid_line_style(reader)?;
  let major_screen_lines = read_grid_line_style(reader)?;
  let minor_printer_lines = read_grid_line_style(reader)?;
  let major_printer_lines = read_grid_line_style(reader)?;
  reader.seek_relative(12)?;

  Ok(Grid {
    major_lines_interval,
    minor_screen_lines,
    major_screen_lines,
    minor_printer_lines,
    major_printer_lines,
  })
}

fn read_pattern_info<R: Read + Seek>(reader: &mut R) -> io::Result<PatternInfo> {
  log::trace!("Reading pattern info");
  Ok(PatternInfo {
    title: reader.read_cstring(PATTERN_NAME_LENGTH)?,
    author: reader.read_cstring(AUTHOR_NAME_LENGTH)?,
    company: reader.read_cstring(COMPANY_NAME_LENGTH)?,
    copyright: reader.read_cstring(COPYRIGHT_LENGTH)?,
    description: reader.read_cstring(PATTERN_NOTES_LENGTH)?,
  })
}

fn read_stitch_settings<R: Read + Seek>(reader: &mut R) -> io::Result<StitchSettings> {
  log::trace!("Reading stitch settings");

  let default_strands = StitchStrands {
    full: reader.read_u16::<LittleEndian>()? as u8,
    half: reader.read_u16::<LittleEndian>()? as u8,
    quarter: reader.read_u16::<LittleEndian>()? as u8,
    back: reader.read_u16::<LittleEndian>()? as u8,
    petite: reader.read_u16::<LittleEndian>()? as u8,
    special: reader.read_u16::<LittleEndian>()? as u8,
    french_knot: 2,
    straight: reader.read_u16::<LittleEndian>()? as u8,
  };
  let display_thickness = {
    let mut arr = [0.0; 13];
    for thickness in arr.iter_mut() {
      *thickness = reader.read_u16::<LittleEndian>()? as f32 / 10.0;
    }
    arr
  };

  let outlined_stitches = reader.read_u16::<LittleEndian>()? == 1;
  let use_specified_color = reader.read_u16::<LittleEndian>()? == 1;
  let stitch_outline = StitchOutline {
    color_percentage: reader.read_u16::<LittleEndian>()? as u8,
    color: if use_specified_color {
      let color = reader.read_hex_color()?;
      reader.seek_relative(1)?;
      Some(color)
    } else {
      reader.seek_relative(4)?;
      None
    },
    thickness: reader.read_u16::<LittleEndian>()? as f32 / 10.0,
  };

  Ok(StitchSettings {
    default_strands,
    display_thickness,
    outlined_stitches,
    stitch_outline,
  })
}

fn read_symbol_settings<R: Read + Seek>(reader: &mut R) -> io::Result<SymbolSettings> {
  log::trace!("Reading symbol settings");
  Ok(SymbolSettings {
    screen_spacing: (reader.read_u16::<LittleEndian>()?, reader.read_u16::<LittleEndian>()?),
    printer_spacing: (reader.read_u16::<LittleEndian>()?, reader.read_u16::<LittleEndian>()?),
    scale_using_maximum_font_width: reader.read_u16::<LittleEndian>()? == 1,
    scale_using_font_height: reader.read_u16::<LittleEndian>()? == 1,
    small_stitch_size: reader.read_u16::<LittleEndian>()? as u8,
    show_stitch_color: reader.read_u16::<LittleEndian>()? == 1,
    use_large_half_stitch_symbol: {
      let use_large_half_stitch_symbol = reader.read_u16::<LittleEndian>()? == 1;
      reader.seek_relative(6)?;
      use_large_half_stitch_symbol
    },
    stitch_size: reader.read_u16::<LittleEndian>()? as u8,
    use_triangles_behind_quarter_stitches: reader.read_u16::<LittleEndian>()? == 1,
    draw_symbols_over_backstitches: {
      let draw_symbols_over_backstitches = reader.read_u16::<LittleEndian>()? == 1;
      reader.seek_relative(2)?;
      draw_symbols_over_backstitches
    },
  })
}

fn read_stitches<R: Read>(
  reader: &mut R,
  coord_factor: usize,
  total_stitches_count: usize,
  small_stitches_count: usize,
) -> io::Result<(Vec<FullStitch>, Vec<PartStitch>)> {
  log::trace!("Reading stitches");
  let stitches_data = read_stitches_data(reader, total_stitches_count)?;
  let small_stitch_buffers = read_small_stitch_buffers(reader, small_stitches_count)?;
  let stitches = map_stitches_data_into_stitches(stitches_data, small_stitch_buffers, coord_factor)?;
  Ok(stitches)
}

/// Reads the bytes buffer that contains the decoded stitches data.
fn read_stitches_data<R: Read>(reader: &mut R, total_stitches_count: usize) -> io::Result<Vec<i32>> {
  let mut stitches_data = Vec::with_capacity(total_stitches_count);
  let mut xsd_random_numbers = {
    let mut xsd_random_numbers = [0; 4];
    for number in &mut xsd_random_numbers {
      *number = reader.read_i32::<LittleEndian>()?;
    }
    xsd_random_numbers
  };
  let (mut decoding_key, decoding_numbers) = reproduce_decoding_values(&xsd_random_numbers)?;
  let mut decoding_number_index = 0;
  let mut stitch_index = 0;

  while stitch_index < total_stitches_count {
    let stitches_data_length = reader.read_u32::<LittleEndian>()? as usize;

    if stitches_data_length == 0 {
      continue;
    }

    let mut decoded_stitches_data = Vec::with_capacity(stitches_data_length);

    // Decoding.
    for _ in 0..stitches_data_length {
      let stitch_data = reader.read_i32::<LittleEndian>()? ^ decoding_key ^ xsd_random_numbers[0];
      decoded_stitches_data.push(stitch_data);
      decoding_key = decoding_key.rotate_left(decoding_numbers[decoding_number_index]);
      xsd_random_numbers[0] = xsd_random_numbers[0].wrapping_add(xsd_random_numbers[1]);
      decoding_number_index = (decoding_number_index + 1) % 16;
    }

    // Copying.
    let mut stitch_data_index = 0;
    while stitch_data_index < stitches_data_length {
      let mut copy_count = 1;
      let elem = decoded_stitches_data[stitch_data_index];

      if elem & (i32::MAX / 2 + 1) != 0 {
        copy_count = (elem & (i32::MAX / 2)) >> 16;
        stitch_data_index += 1;
      }

      while copy_count > 0 {
        stitches_data.push(decoded_stitches_data[stitch_data_index]);
        stitch_index += 1;
        copy_count -= 1;
      }

      stitch_data_index += 1;
    }
  }

  Ok(stitches_data)
}

/// Reproduces the decoding values that are used for decoding the stitches data.
fn reproduce_decoding_values(xsd_random_numbers: &[i32; 4]) -> io::Result<(i32, [u32; 16])> {
  let val1 = xsd_random_numbers[1].to_le_bytes()[1] as i32;
  let val2 = xsd_random_numbers[0] << 8;
  let val3 = (val2 | val1) << 8;
  let val4 = xsd_random_numbers[2].to_le_bytes()[2] as i32;
  let val5 = (val4 | val3) << 8;
  let val6 = xsd_random_numbers[3] & 0xFF;
  let decoding_key = val6 | val5;

  let mut decoding_buffer = [0; 16];

  for i in 0..4 {
    let buf = xsd_random_numbers[i].to_le_bytes();
    for j in 0..4 {
      decoding_buffer[i * 4 + j] = buf[j];
    }
  }

  let mut decoding_buffer = io::Cursor::new(decoding_buffer);
  let mut decoding_numbers = [0; 16];

  for i in 0..16 {
    let offset = (i / 4) * 4; // 0, 4, 8, 12.
    decoding_buffer.seek(SeekFrom::Start(offset))?;
    let shift = decoding_buffer.read_u32::<LittleEndian>()? >> (i % 4);
    decoding_numbers[i as usize] = shift % 32;
  }

  Ok((decoding_key, decoding_numbers))
}

/// Reads the small stitch buffers that are used containe the small stitches data.
fn read_small_stitch_buffers<R: Read>(reader: &mut R, small_stitches_count: usize) -> io::Result<Vec<[u8; 10]>> {
  let mut small_stitch_buffers = Vec::with_capacity(small_stitches_count);
  for _ in 0..small_stitches_count {
    let mut buf = [0; 10];
    reader.read_exact(&mut buf)?;
    small_stitch_buffers.push(buf);
  }
  Ok(small_stitch_buffers)
}

#[derive(Debug, Clone, PartialEq)]
enum XsdSmallStitchKind {
  HalfTop,
  HalfBottom,
  QuarterTopLeft,
  QuarterBottomLeft,
  QuarterTopRight,
  QuarterBottomRight,
  PetiteTopLeft,
  PetiteBottomLeft,
  PetiteTopRight,
  PetiteBottomRight,
}

/// Maps the stitches data into the full- and partstitches .
fn map_stitches_data_into_stitches(
  stitches_data: Vec<i32>,
  small_stitch_buffers: Vec<[u8; 10]>,
  coord_factor: usize,
) -> io::Result<(Vec<FullStitch>, Vec<PartStitch>)> {
  let mut fullstitches = Vec::new();
  let mut partstitches = Vec::new();

  for (i, stitch_data) in stitches_data.iter().enumerate() {
    let stitch_buffer = stitch_data.to_le_bytes();

    // Empty cell.
    if stitch_buffer[3] == 15 {
      continue;
    }

    let x = (i % coord_factor) as f32;
    let y = (i / coord_factor) as f32;

    if stitch_buffer[3] == 0 {
      fullstitches.push(FullStitch {
        x,
        y,
        palindex: stitch_buffer[2],
        kind: FullStitchKind::Full,
      });
      continue;
    }

    let position = (stitches_data[i] >> 16) & ((u16::MAX / 2) as i32);
    let small_stitch_buffer = small_stitch_buffers.get(position as usize).unwrap();

    for (significant_byte_index, bitand_arg, palindex_index, kind) in [
      (1, 1, 4, XsdSmallStitchKind::PetiteTopLeft),
      (1, 2, 5, XsdSmallStitchKind::PetiteBottomLeft),
      (1, 4, 6, XsdSmallStitchKind::PetiteTopRight),
      (1, 8, 7, XsdSmallStitchKind::PetiteBottomRight),
    ] {
      let (x, y) = adjust_small_stitch_coors(x, y, kind)?;
      if small_stitch_buffer[significant_byte_index] & bitand_arg != 0 {
        fullstitches.push(FullStitch {
          x,
          y,
          palindex: small_stitch_buffer[palindex_index],
          kind: FullStitchKind::Petite,
        })
      }
    }

    for (significant_byte_index, bitand_arg, palindex_index, kind) in [
      (0, 1, 2, XsdSmallStitchKind::HalfTop),
      (0, 2, 3, XsdSmallStitchKind::HalfBottom),
      (0, 4, 4, XsdSmallStitchKind::QuarterTopLeft),
      (0, 8, 5, XsdSmallStitchKind::QuarterBottomLeft),
      (0, 16, 6, XsdSmallStitchKind::QuarterTopRight),
      (0, 32, 7, XsdSmallStitchKind::QuarterBottomRight),
    ] {
      if small_stitch_buffer[significant_byte_index] & bitand_arg != 0 {
        let (x, y) = adjust_small_stitch_coors(x, y, kind.clone())?;
        let direction = match kind {
          XsdSmallStitchKind::HalfTop | XsdSmallStitchKind::QuarterTopLeft | XsdSmallStitchKind::QuarterBottomRight => {
            PartStitchDirection::Backward
          }
          _ => PartStitchDirection::Forward,
        };
        let kind = match kind {
          XsdSmallStitchKind::HalfTop | XsdSmallStitchKind::HalfBottom => PartStitchKind::Half,
          _ => PartStitchKind::Quarter,
        };
        partstitches.push(PartStitch {
          x,
          y,
          palindex: small_stitch_buffer[palindex_index],
          direction,
          kind,
        })
      }
    }
  }

  Ok((fullstitches, partstitches))
}

/// Adjusts the coordinates of the small stitch.
/// The XSD format contains coordinates without additional offsets relative to the cell.
/// But this is important for us.
fn adjust_small_stitch_coors(x: f32, y: f32, kind: XsdSmallStitchKind) -> io::Result<(f32, f32)> {
  match kind {
    XsdSmallStitchKind::QuarterTopLeft | XsdSmallStitchKind::PetiteTopLeft => Ok((x, y)),
    XsdSmallStitchKind::QuarterTopRight | XsdSmallStitchKind::PetiteTopRight => Ok((x + 0.5, y)),
    XsdSmallStitchKind::QuarterBottomLeft | XsdSmallStitchKind::PetiteBottomLeft => Ok((x, y + 0.5)),
    XsdSmallStitchKind::QuarterBottomRight | XsdSmallStitchKind::PetiteBottomRight => Ok((x + 0.5, y + 0.5)),
    _ => Ok((x, y)),
  }
}

fn read_special_stitch_models<R: Read + Seek>(reader: &mut R) -> io::Result<Vec<SpecialStitchModel>> {
  log::trace!("Reading special stitch models");

  reader.seek_relative(2)?;
  let special_stith_models_count = reader.read_u16::<LittleEndian>()? as usize;
  let mut special_stitch_models = Vec::with_capacity(special_stith_models_count);

  for _ in 0..special_stith_models_count {
    if reader.read_u16::<LittleEndian>()? != 4 {
      continue;
    }

    reader.seek_relative(2)?;
    let mut special_stitch_kind_buf = vec![0; 4];
    reader.read_exact(&mut special_stitch_kind_buf)?;

    if String::from_utf8(special_stitch_kind_buf).unwrap() != "sps1" {
      continue;
    }

    let mut special_stitch_model = SpecialStitchModel {
      unique_name: reader.read_cstring(SPECIAL_STITCH_NAME_LENGTH)?,
      name: reader.read_cstring(SPECIAL_STITCH_NAME_LENGTH)?,
      ..Default::default()
    };
    let mut shift = (0.0, 0.0);
    reader.seek_relative(2)?;

    for i in 0..3 {
      if i == 0 {
        reader.seek_relative(2)?;
        shift = (
          reader.read_u16::<LittleEndian>()? as f32 / 2.0,
          reader.read_u16::<LittleEndian>()? as f32 / 2.0,
        );
        special_stitch_model.width = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
        special_stitch_model.height = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
      } else {
        reader.seek_relative(10)?;
      }

      if read_signature(reader)? != VALID_SIGNATURE {
        break;
      }

      let joints_count = reader.read_u16::<LittleEndian>()?;
      if joints_count == 0 {
        continue;
      }

      if i == 0 || i == 2 {
        let (linestitches, nodestitches, _specialstitches, curvedstitches) = read_joints(reader, joints_count)?;
        special_stitch_model.linestitches.extend(linestitches);
        special_stitch_model.nodestitches.extend(nodestitches);
        special_stitch_model.curvedstitches.extend(curvedstitches);
      } else {
        read_joints(reader, joints_count)?;
      }
    }

    // Adjust the coordinates of the curvedstitches.
    for curve in special_stitch_model.curvedstitches.iter_mut() {
      curve.points = curve.points.iter().map(|(x, y)| (*x - shift.0, *y - shift.1)).collect();
    }

    special_stitch_models.push(special_stitch_model);
  }

  Ok(special_stitch_models)
}

#[derive(Debug, PartialEq)]
enum XsdJointKind {
  FrenchKnot,
  Back,
  Curve,
  Special,
  Straight,
  Bead,
}

impl From<u16> for XsdJointKind {
  fn from(value: u16) -> Self {
    match value {
      1 => XsdJointKind::FrenchKnot,
      2 => XsdJointKind::Back,
      3 => XsdJointKind::Curve,
      4 => XsdJointKind::Special,
      5 => XsdJointKind::Straight,
      6 => XsdJointKind::Bead,
      _ => unreachable!("Invalid joint kind {value}"),
    }
  }
}

type Joints = (Vec<LineStitch>, Vec<NodeStitch>, Vec<SpecialStitch>, Vec<CurvedStitch>);

/// Reads the french knots, beads, back, straight and special stitches and curved stitches used in the pattern.
fn read_joints<R: Read + Seek>(reader: &mut R, joints_count: u16) -> io::Result<Joints> {
  log::trace!("Reading joints");

  let mut linestitches = Vec::new();
  let mut nodestitches = Vec::new();
  let mut specialstitches = Vec::new();
  let mut curvedstitches = Vec::new();

  for _ in 0..joints_count {
    let joint_kind = XsdJointKind::from(reader.read_u16::<LittleEndian>()?);
    match joint_kind {
      XsdJointKind::FrenchKnot => {
        reader.seek_relative(2)?;
        let x = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
        let y = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
        reader.seek_relative(4)?;
        let palindex = reader.read_u8()?;
        reader.seek_relative(1)?;
        nodestitches.push(NodeStitch {
          x,
          y,
          rotated: false,
          palindex,
          kind: NodeStitchKind::FrenchKnot,
        });
      }

      XsdJointKind::Back | XsdJointKind::Straight => {
        reader.seek_relative(2)?;
        let x1 = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
        let y1 = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
        let x2 = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
        let y2 = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
        let palindex = reader.read_u8()?;
        reader.seek_relative(1)?;
        let kind = if joint_kind == XsdJointKind::Back {
          LineStitchKind::Back
        } else {
          LineStitchKind::Straight
        };
        linestitches.push(LineStitch {
          x: (x1, x2),
          y: (y1, y2),
          palindex,
          kind,
        });
      }

      XsdJointKind::Curve => {
        reader.seek_relative(3)?;
        let points_count = reader.read_u16::<LittleEndian>()? as usize;
        let mut curve = CurvedStitch {
          points: Vec::with_capacity(points_count),
        };
        for _ in 0..points_count {
          // 15.0 is the resolution of the curve points.
          // 2.0 is the factor that is used to convert the XSD coordinates to the pattern coordinates.
          let x = reader.read_u16::<LittleEndian>()? as f32 / 15.0 / 2.0;
          let y = reader.read_u16::<LittleEndian>()? as f32 / 15.0 / 2.0;
          curve.points.push((x, y));
        }
        curvedstitches.push(curve);
      }

      XsdJointKind::Special => {
        reader.seek_relative(2)?;
        let palindex = reader.read_u8()?;
        reader.seek_relative(4)?;
        let x = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
        let y = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
        let (rotation, flip) = {
          let mut flip = (false, false);
          let mut rotation = 0;

          let param1 = reader.read_u16::<LittleEndian>()?;
          let param2 = reader.read_u16::<LittleEndian>()?;
          let param3 = reader.read_u16::<LittleEndian>()?;
          let param4 = reader.read_u16::<LittleEndian>()?;

          if param1 == 0xFFFF && param2 == 0 && param3 == 0 && param4 == 1 {
            flip.0 = true;
          } else if param1 == 1 && param2 == 0 && param3 == 0 && param4 == 0xFFFF {
            flip.1 = true;
          } else if param1 == 0xFFFF && param2 == 0 && param3 == 0 && param4 == 0xFFFF {
            flip.0 = true;
            flip.1 = true;
          } else if param1 == 0 && param2 == 0xFFFF && param3 == 1 && param4 == 0 {
            rotation = 90;
          } else if param1 == 0 && param2 == 1 && param3 == 0xFFFF && param4 == 0 {
            rotation = 270;
          } else if param1 == 0 && param2 == 1 && param3 == 1 && param4 == 0 {
            flip.1 = true;
            rotation = 90;
          } else if param1 == 0 && param2 == 0xFFFF && param3 == 0xFFFF && param4 == 0 {
            flip.0 = true;
            rotation = 90;
          }

          (rotation, flip)
        };
        reader.seek_relative(2)?;
        let modindex = reader.read_u16::<LittleEndian>()? as u8;
        specialstitches.push(SpecialStitch {
          x,
          y,
          palindex,
          modindex,
          rotation,
          flip,
        });
      }

      XsdJointKind::Bead => {
        reader.seek_relative(2)?;
        let x = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
        let y = reader.read_u16::<LittleEndian>()? as f32 / 2.0;
        let palindex = reader.read_u8()?;
        reader.seek_relative(1)?;
        let rotated = matches!(reader.read_u16::<LittleEndian>()?, 90 | 270);
        nodestitches.push(NodeStitch {
          x,
          y,
          rotated,
          palindex,
          kind: NodeStitchKind::Bead,
        });
      }
    }
  }

  Ok((linestitches, nodestitches, specialstitches, curvedstitches))
}
