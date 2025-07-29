use std::io;

use anyhow::Result;
use embroiderly_pattern::*;
use quick_xml::events::{BytesDecl, BytesStart, Event};
use quick_xml::{Reader, Writer};

use crate::oxs::utils::AttributesMap;

#[cfg(test)]
#[path = "display_settings.test.rs"]
mod tests;

pub fn parse_display_settings_from_reader<R: io::BufRead>(reader: &mut R) -> Result<DisplaySettings> {
  let mut reader = Reader::from_reader(reader);
  let reader_config = reader.config_mut();
  reader_config.expand_empty_elements = true;
  reader_config.check_end_names = true;
  reader_config.trim_text(true);

  let mut buf = Vec::new();
  let display_settings = loop {
    match reader
      .read_event_into(&mut buf)
      .map_err(|e| anyhow::anyhow!("Error at position {}: {e:?}", reader.error_position()))?
    {
      Event::Start(ref e) if e.name().as_ref() == b"display_settings" => {
        let attributes = AttributesMap::try_from(e.attributes())?;
        break parse_display_settings_inner(&mut reader, attributes)?;
      }
      Event::Eof => anyhow::bail!("Unexpected EOF. It seems that the `display_settings` tag is not found."),
      _ => {}
    }
    buf.clear();
  };

  Ok(display_settings)
}

fn parse_display_settings_inner<R: io::BufRead>(
  reader: &mut Reader<R>,
  attributes: AttributesMap,
) -> Result<DisplaySettings> {
  let mut display_settings = DisplaySettings::default();

  if let Some(default_symbol_font) = attributes.get("default_symbol_font") {
    display_settings.default_symbol_font = default_symbol_font.to_owned();
  }

  if let Some(display_mode) = attributes.get_parsed("display_mode") {
    display_settings.display_mode = display_mode;
  }

  if let Some(show_symbols) = attributes.get_bool("show_symbols") {
    display_settings.show_symbols = show_symbols;
  }

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) => match e.name().as_ref() {
        b"palette_settings" => {
          let attributes = AttributesMap::try_from(e.attributes())?;
          display_settings.palette_settings = read_palette_settings(attributes)?;
        }
        b"grid" => {
          let attributes = AttributesMap::try_from(e.attributes())?;
          display_settings.grid = read_grid(reader, attributes)?;
        }
        b"layers_visibility" => {
          let attributes = AttributesMap::try_from(e.attributes())?;
          display_settings.layers_visibility = read_layers_visibility(attributes)?;
        }
        _ => {}
      },
      Event::End(ref e) if e.name().as_ref() == b"display_settings" => break,
      Event::Eof => anyhow::bail!("Unexpected EOF. The end of the `display_settings` tag is not found."),
      _ => {}
    }
    buf.clear();
  }

  Ok(display_settings)
}

pub fn save_display_settings_to_vec(display_settings: &DisplaySettings) -> Result<Vec<u8>> {
  // In the development mode, we want to have a pretty-printed XML file for easy debugging.
  #[cfg(debug_assertions)]
  let mut writer = Writer::new_with_indent(Vec::new(), b' ', 2);
  #[cfg(not(debug_assertions))]
  let mut writer = Writer::new(Vec::new());

  writer.write_event(Event::Decl(BytesDecl::new("1.0", Some("UTF-8"), None)))?;
  writer
    .create_element("display_settings")
    .with_attributes([
      ("display_mode", display_settings.display_mode.to_string().as_str()),
      ("default_symbol_font", display_settings.default_symbol_font.as_str()),
      ("show_symbols", display_settings.show_symbols.to_string().as_str()),
    ])
    .write_inner_content(|writer| {
      write_palette_settings(writer, &display_settings.palette_settings)?;
      write_grid(writer, &display_settings.grid)?;
      write_layers_visibility(writer, &display_settings.layers_visibility)?;
      Ok(())
    })?;

  Ok(writer.into_inner())
}

fn read_palette_settings(attributes: AttributesMap) -> Result<PaletteSettings> {
  Ok(PaletteSettings {
    columns_number: attributes
      .get_parsed("columns_number")
      .unwrap_or(PaletteSettings::DEFAULT_COLUMNS_NUMBER),
    color_only: attributes
      .get_parsed("color_only")
      .unwrap_or(PaletteSettings::DEFAULT_COLOR_ONLY),
    show_color_brands: attributes
      .get_parsed("show_color_brands")
      .unwrap_or(PaletteSettings::DEFAULT_SHOW_COLOR_BRANDS),
    show_color_numbers: attributes
      .get_parsed("show_color_names")
      .unwrap_or(PaletteSettings::DEFAULT_SHOW_COLOR_NAMES),
    show_color_names: attributes
      .get_parsed("show_color_numbers")
      .unwrap_or(PaletteSettings::DEFAULT_SHOW_COLOR_NUMBERS),
  })
}

fn write_palette_settings<W: io::Write>(writer: &mut Writer<W>, settings: &PaletteSettings) -> io::Result<()> {
  writer
    .create_element("palette_settings")
    .with_attributes([
      ("columns_number", settings.columns_number.to_string().as_str()),
      ("color_only", settings.color_only.to_string().as_str()),
      ("show_color_brands", settings.show_color_brands.to_string().as_str()),
      ("show_color_names", settings.show_color_names.to_string().as_str()),
      ("show_color_numbers", settings.show_color_numbers.to_string().as_str()),
    ])
    .write_empty()?;
  Ok(())
}

fn read_grid<R: io::BufRead>(reader: &mut Reader<R>, attributes: AttributesMap) -> Result<Grid> {
  let mut grid = Grid::default();

  if let Some(interval) = attributes.get_parsed("major_lines_interval") {
    grid.major_lines_interval = interval;
  }

  fn parse_grid_line(event: &BytesStart<'_>) -> Result<GridLine> {
    let attributes = AttributesMap::try_from(event.attributes())?;
    Ok(GridLine {
      color: attributes.get("color").unwrap_or("C8C8C8").to_string(),
      thickness: attributes.get_parsed("thickness").unwrap_or(0.072),
    })
  }

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) => match e.name().as_ref() {
        b"minor_lines" => grid.minor_lines = parse_grid_line(e)?,
        b"major_lines" => grid.major_lines = parse_grid_line(e)?,
        _ => {}
      },
      Event::End(ref e) if e.name().as_ref() == b"grid" => break,
      _ => {}
    }
    buf.clear();
  }

  Ok(grid)
}

fn write_grid<W: io::Write>(writer: &mut Writer<W>, grid: &Grid) -> io::Result<()> {
  fn write_grid_line<W: io::Write>(writer: &mut Writer<W>, element: &str, line: &GridLine) -> io::Result<()> {
    writer
      .create_element(element)
      .with_attributes([
        ("color", line.color.as_str()),
        ("thickness", line.thickness.to_string().as_str()),
      ])
      .write_empty()?;
    Ok(())
  }

  writer
    .create_element("grid")
    .with_attributes([("major_lines_interval", grid.major_lines_interval.to_string().as_str())])
    .write_inner_content(|writer| {
      write_grid_line(writer, "minor_lines", &grid.minor_lines)?;
      write_grid_line(writer, "major_lines", &grid.major_lines)?;
      Ok(())
    })?;

  Ok(())
}

fn read_layers_visibility(attributes: AttributesMap) -> Result<LayersVisibility> {
  Ok(LayersVisibility {
    fullstitches: attributes.get_bool("fullstitches").unwrap_or_default(),
    petitestitches: attributes.get_bool("petitestitches").unwrap_or_default(),
    halfstitches: attributes.get_bool("halfstitches").unwrap_or_default(),
    quarterstitches: attributes.get_bool("quarterstitches").unwrap_or_default(),
    backstitches: attributes.get_bool("backstitches").unwrap_or_default(),
    straightstitches: attributes.get_bool("straightstitches").unwrap_or_default(),
    frenchknots: attributes.get_bool("frenchknots").unwrap_or_default(),
    beads: attributes.get_bool("beads").unwrap_or_default(),
    specialstitches: attributes.get_bool("specialstitches").unwrap_or_default(),
    grid: attributes.get_bool("grid").unwrap_or_default(),
    rulers: attributes.get_bool("rulers").unwrap_or_default(),
  })
}

fn write_layers_visibility<W: io::Write>(writer: &mut Writer<W>, layers: &LayersVisibility) -> io::Result<()> {
  writer
    .create_element("layers_visibility")
    .with_attributes([
      ("fullstitches", layers.fullstitches.to_string().as_str()),
      ("petitestitches", layers.petitestitches.to_string().as_str()),
      ("halfstitches", layers.halfstitches.to_string().as_str()),
      ("quarterstitches", layers.quarterstitches.to_string().as_str()),
      ("backstitches", layers.backstitches.to_string().as_str()),
      ("straightstitches", layers.straightstitches.to_string().as_str()),
      ("frenchknots", layers.frenchknots.to_string().as_str()),
      ("beads", layers.beads.to_string().as_str()),
      ("specialstitches", layers.specialstitches.to_string().as_str()),
      ("grid", layers.grid.to_string().as_str()),
      ("rulers", layers.rulers.to_string().as_str()),
    ])
    .write_empty()?;
  Ok(())
}
