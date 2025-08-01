use std::io;

use anyhow::Result;
use embroiderly_pattern::*;
use quick_xml::events::{BytesDecl, BytesStart, Event};
use quick_xml::{Reader, Writer};

use crate::PackageInfo;

#[cfg(test)]
#[path = "oxs.test.rs"]
mod tests;

// These are utility functions to work with the OXS format.

struct AttributesMap {
  inner: std::collections::HashMap<String, String>,
}

impl AttributesMap {
  fn get(&self, key: &str) -> Option<&str> {
    self.inner.get(key).map(|s| s.as_str())
  }

  fn get_coord(&self, key: &str) -> Option<Coord> {
    self.get(key).and_then(|s| {
      let normalized = s.replace(',', ".");
      normalized.parse().ok()
    })
  }

  fn get_palindex(&self, key: &str) -> Option<u32> {
    match self.get(key).and_then(|s| s.parse::<u32>().ok()) {
      Some(palindex) if palindex != 0 => Some(palindex - 1),
      _ => None,
    }
  }

  fn get_color(&self, key: &str) -> Option<&str> {
    let color = self.get(key);
    if color.is_some_and(|c| c.is_empty() || c == "nil") {
      None
    } else {
      color
    }
  }

  fn get_objecttype(&self, key: &str) -> Option<String> {
    self
      .get(key)
      .and_then(|s| if s.is_empty() { None } else { Some(s.to_owned()) })
  }

  fn get_bool(&self, key: &str) -> Option<bool> {
    self.get(key).and_then(|s| {
      let normalized = s.to_lowercase();
      normalized.parse().ok()
    })
  }

  fn get_parsed<T: std::str::FromStr>(&self, key: &str) -> Option<T> {
    self.get(key).and_then(|s| s.parse::<T>().ok())
  }
}

impl TryFrom<quick_xml::events::attributes::Attributes<'_>> for AttributesMap {
  type Error = anyhow::Error;

  fn try_from(attributes: quick_xml::events::attributes::Attributes) -> Result<Self, Self::Error> {
    let mut map = std::collections::HashMap::new();
    for attr in attributes {
      let attr = attr?;
      let key = String::from_utf8(attr.key.as_ref().to_vec())?;
      let value = String::from_utf8(attr.value.to_vec())?;
      map.insert(key, value);
    }
    Ok(AttributesMap { inner: map })
  }
}

/// Tries to get a value using the provided expression.
/// If the result is `Some(value)`, returns the unwrapped value.
/// Otherwise, continues the current loop.
macro_rules! unwrap_or_continue {
  ($expr:expr) => {
    if let Some(value) = $expr {
      value
    } else {
      continue;
    }
  };
  ($expr:expr, $default:expr) => {
    if let Some(value) = $expr {
      value
    } else {
      return $default;
    }
  };
}

// These are the main functions to parse and save OXS files.

pub fn parse_pattern(file_path: std::path::PathBuf) -> Result<PatternProject> {
  let mut reader = Reader::from_file(&file_path)?;
  let reader_config = reader.config_mut();
  reader_config.expand_empty_elements = true;
  reader_config.check_end_names = true;
  reader_config.trim_text(true);

  let mut buf = Vec::new();
  let mut pattern = loop {
    match reader
      .read_event_into(&mut buf)
      .map_err(|e| anyhow::anyhow!("Error at position {}: {e:?}", reader.error_position()))?
    {
      Event::Start(ref e) if e.name().as_ref() == b"chart" => break parse_pattern_inner(&mut reader)?,
      Event::Eof => anyhow::bail!("Unexpected EOF. It seems that the `chart` tag is not found."),
      _ => {}
    }
    buf.clear();
  };

  if pattern.info.title.is_empty() {
    // The file name is provided by the file picker so it is always valid.
    let file_name = file_path.file_name().unwrap().to_string_lossy().to_string();
    pattern.info.title = file_name;
  }

  Ok(PatternProject::new(
    file_path,
    pattern,
    Default::default(),
    Default::default(),
  ))
}

fn parse_pattern_inner<R: io::BufRead>(reader: &mut Reader<R>) -> Result<Pattern> {
  log::trace!("Parsing OXS file");

  let mut pattern = Pattern::default();
  let mut palette_size = None;

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) => {
        let name = e.name();
        log::trace!("Parsing {}", String::from_utf8_lossy(name.as_ref()));

        match name.as_ref() {
          b"properties" => {
            let attributes = AttributesMap::try_from(e.attributes())?;

            let oxs_version = attributes.get("oxsversion").unwrap_or("1.0");
            let software = attributes.get("software").unwrap_or("Unknown");
            let software_version = attributes.get("software_version").unwrap_or("Unknown");
            log::trace!("OXS version: {oxs_version}. In {software} ({software_version}) edition.");

            let (pattern_width, pattern_height, pattern_info, spi, palsize) = read_pattern_properties(attributes)?;
            pattern.info = pattern_info;
            pattern.fabric.width = pattern_width;
            pattern.fabric.height = pattern_height;
            pattern.fabric.spi = spi;
            palette_size = palsize;
          }
          b"palette" => {
            let (fabric, palette) = read_palette(reader, palette_size)?;
            pattern.fabric = Fabric {
              name: fabric.name,
              color: fabric.color,
              kind: fabric.kind,
              ..pattern.fabric
            };
            pattern.palette = palette;
          }
          b"fullstitches" => pattern.fullstitches.extend(
            read_full_stitches(reader)?
              .into_iter()
              .filter(|stitch| stitch.palindex < pattern.palette.len() as u32),
          ),
          b"partstitches" => pattern.partstitches.extend(
            read_part_stitches(reader)?
              .into_iter()
              .filter(|stitch| stitch.palindex < pattern.palette.len() as u32),
          ),
          b"backstitches" => pattern.linestitches.extend(
            read_line_stitches(reader)?
              .into_iter()
              .filter(|stitch| stitch.palindex < pattern.palette.len() as u32),
          ),
          b"ornaments_inc_knots_and_beads" => {
            let (fullstitches, partstitches, nodestitches, specialstitches) = read_ornaments(reader)?;
            pattern.fullstitches.extend(
              fullstitches
                .into_iter()
                .filter(|stitch| stitch.palindex < pattern.palette.len() as u32),
            );
            pattern.partstitches.extend(
              partstitches
                .into_iter()
                .filter(|stitch| stitch.palindex < pattern.palette.len() as u32),
            );
            pattern.nodestitches.extend(
              nodestitches
                .into_iter()
                .filter(|stitch| stitch.palindex < pattern.palette.len() as u32),
            );
            pattern.specialstitches.extend(
              specialstitches
                .into_iter()
                .filter(|stitch| stitch.palindex < pattern.palette.len() as u32),
            );
          }
          b"special_stitch_models" => pattern
            .special_stitch_models
            .extend(read_special_stitch_models(reader)?),
          _ => {}
        }
      }
      Event::End(ref e) if e.name().as_ref() == b"chart" => break,
      Event::Eof => anyhow::bail!("Unexpected EOF. The end of the `chart` tag is not found."),
      _ => {}
    }
    buf.clear();
  }

  log::trace!("OXS file parsed");
  Ok(pattern)
}

pub fn save_pattern(patproj: &PatternProject, package_info: &PackageInfo) -> Result<()> {
  let mut file = std::fs::OpenOptions::new()
    .create(true)
    .write(true)
    .truncate(true)
    .open(&patproj.file_path)?;
  Ok(save_pattern_inner(&mut file, patproj, package_info)?)
}

pub fn save_pattern_to_vec(patproj: &PatternProject, package_info: &PackageInfo) -> Result<Vec<u8>> {
  let mut buf = Vec::new();
  save_pattern_inner(&mut buf, patproj, package_info)?;
  Ok(buf)
}

fn save_pattern_inner<W: io::Write>(
  writer: &mut W,
  patproj: &PatternProject,
  package_info: &PackageInfo,
) -> io::Result<()> {
  log::trace!("Saving OXS file");

  let PatternProject { pattern, display_settings, .. } = patproj;

  // In the development mode, we want to have a pretty-printed XML file for easy debugging.
  #[cfg(debug_assertions)]
  let mut writer = Writer::new_with_indent(writer, b' ', 2);
  #[cfg(not(debug_assertions))]
  let mut writer = Writer::new(writer);

  writer.write_event(Event::Decl(BytesDecl::new("1.0", Some("UTF-8"), None)))?;
  writer.create_element("chart").write_inner_content(|writer| {
    write_format(writer)?;
    write_pattern_properties(
      writer,
      pattern.fabric.width,
      pattern.fabric.height,
      &pattern.info,
      pattern.fabric.spi,
      pattern.palette.len(),
      package_info,
    )?;
    write_palette(
      writer,
      &pattern.fabric,
      &pattern.palette,
      &display_settings.default_symbol_font,
    )?;
    write_full_stitches(writer, &pattern.fullstitches)?;
    write_line_stitches(writer, &pattern.linestitches)?;
    write_ornaments(
      writer,
      &pattern.fullstitches,
      &pattern.partstitches,
      &pattern.nodestitches,
      &pattern.specialstitches,
    )?;
    write_special_stitch_models(writer, &pattern.special_stitch_models)?;
    Ok(())
  })?;

  log::trace!("OXS file saved");
  Ok(())
}

// These are the functions to read and write separate sections of the OXS file.

fn write_format<W: io::Write>(writer: &mut Writer<W>) -> io::Result<()> {
  writer
    .create_element("format")
    .with_attributes([
      ("comments01","Designed to allow interchange of basic pattern data between any cross stitch style software"),
      ("comments02","the 'properties' section establishes size, copyright, authorship and software used"),
      ("comments03","The features of each software package varies, but using XML each can pick out the things it can deal with, while ignoring others"),
      ("comments04","The basic items are :"),
      ("comments05","'palette'..a set of colors used in the design: palettecount excludes cloth color, which is item 0"),
      ("comments06","'fullstitches'.. simple crosses"),
      ("comments07","'backstitches'.. lines/objects with a start and end point"),
      ("comments08","(There is a wide variety of ways of treating part stitches, knots, beads and so on.)"),
      ("comments09","Colors are expressed in hex RGB format."),
      ("comments10","Decimal numbers use US/UK format where '.' is the indicator - eg 0.5 is 'half'"),
      ("comments11","For readability, please use words not enumerations"),
      ("comments12","The properties, fullstitches, and backstitches elements should be considered mandatory, even if empty"),
      ("comments13","element and attribute names are always lowercase"),
    ])
    .write_empty()?;
  Ok(())
}

fn read_pattern_properties(
  attributes: AttributesMap,
) -> Result<(u16, u16, PatternInfo, StitchesPerInch, Option<usize>)> {
  let pattern_width = attributes.get_parsed("chartwidth").unwrap_or(Fabric::DEFAULT_WIDTH);
  let pattern_height = attributes.get_parsed("chartheight").unwrap_or(Fabric::DEFAULT_HEIGHT);

  let info = PatternInfo {
    title: attributes.get("charttitle").unwrap_or_default().to_owned(),
    author: attributes.get("author").unwrap_or_default().to_owned(),
    copyright: attributes.get("copyright").unwrap_or_default().to_owned(),
    description: attributes.get("instructions").unwrap_or_default().to_owned(),
  };

  let spi = {
    // If `stitchesperinch` is not specified, use the default value.
    let x = attributes.get_parsed("stitchesperinch").unwrap_or(Fabric::DEFAULT_SPI);
    // If `stitchesperinch_y` is not specified, use the same value as `stitchesperinch`.
    let y = attributes.get_parsed("stitchesperinch_y").unwrap_or(x);
    (x, y)
  };

  let palette_size = attributes.get_parsed("palettecount");

  Ok((pattern_width, pattern_height, info, spi, palette_size))
}

fn write_pattern_properties<W: io::Write>(
  writer: &mut Writer<W>,
  pattern_width: u16,
  pattern_height: u16,
  info: &PatternInfo,
  spi: StitchesPerInch,
  palette_size: usize,
  package_info: &PackageInfo,
) -> io::Result<()> {
  writer
    .create_element("properties")
    .with_attributes([
      ("oxsversion", "1.0"),
      ("software", package_info.name.as_str()),
      ("software_version", package_info.version.as_str()),
      ("chartwidth", pattern_width.to_string().as_str()),
      ("chartheight", pattern_height.to_string().as_str()),
      ("charttitle", info.title.as_str()),
      ("author", info.author.as_str()),
      ("copyright", info.copyright.as_str()),
      ("instructions", info.description.as_str()),
      ("stitchesperinch", spi.0.to_string().as_str()),
      ("stitchesperinch_y", spi.1.to_string().as_str()),
      ("palettecount", palette_size.to_string().as_str()),
    ])
    .write_empty()?;
  Ok(())
}

fn read_palette<R: io::BufRead>(
  reader: &mut Reader<R>,
  palette_size: Option<usize>,
) -> Result<(Fabric, Vec<PaletteItem>)> {
  fn parse_palette_item_number(value: Option<&str>) -> (String, String) {
    if let Some(value) = value {
      // If `number` is specified, try to split it into `brand` and `number`.
      // If it fails, keep `brand` empty and use the whole string as `number`.
      let normalized = value.replace("[+]", "").trim_end().to_owned();
      let (brand, number) = normalized.rsplit_once(' ').unwrap_or(("", &normalized));
      (brand.trim().to_owned(), number.to_owned())
    } else {
      // If `number` is not specified, keep both `brand` and `number` empty.
      (String::new(), String::new())
    }
  }

  let mut fabric = Fabric::default();
  let mut palette = if let Some(size) = palette_size {
    Vec::with_capacity(size)
  } else {
    Vec::new()
  };

  let mut counter: usize = 0;
  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) if e.name().as_ref() == b"palette_item" => {
        let attributes = AttributesMap::try_from(e.attributes())?;
        let index = attributes.get_parsed("index").unwrap_or(counter);

        if index == 0 {
          // The element with index 0 (usually, the first one) is the fabric color.
          fabric = Fabric {
            name: attributes.get("name").unwrap_or(&fabric.name).to_owned(),
            color: attributes.get_color("color").unwrap_or(&fabric.color).to_owned(),
            kind: attributes.get("kind").unwrap_or(&fabric.kind).to_owned(),
            ..Fabric::default()
          };
        } else {
          let (brand, number) = parse_palette_item_number(attributes.get("number"));
          let name = attributes.get("name").unwrap_or_default().to_owned();

          let mut blends = Vec::new();

          // Read Embroiderly-like blends.
          loop {
            buf.clear();
            match reader.read_event_into(&mut buf)? {
              Event::Start(ref e) if e.name().as_ref() == b"blend" => {
                let attributes = AttributesMap::try_from(e.attributes())?;
                let (brand, number) = parse_palette_item_number(attributes.get("number"));
                blends.push(Blend { brand, number });
              }
              Event::End(ref e) if e.name().as_ref() == b"palette_item" => break,
              _ => {}
            }
          }

          // Read Ursa-like blends.
          let blendcolor = attributes.get_color("blendcolor");
          if name.contains("[+]") && blendcolor.is_some() {
            let (number1, number2) = name
              .split_once("[+]")
              .map(|(a, b)| (Some(a), Some(b)))
              .unwrap_or_default();

            let (brand, number) = parse_palette_item_number(number1);
            blends.push(Blend { brand, number });

            let (brand, number) = parse_palette_item_number(number2);
            blends.push(Blend { brand, number });
          }

          palette.push(PaletteItem {
            brand,
            number,
            name,
            color: attributes.get_color("color").unwrap_or("FF00FF").to_owned(),
            blends: if blends.is_empty() { None } else { Some(blends) },
            symbol: attributes.get_parsed("symbol"),
            symbol_font: attributes.get("fontname").map(|s| s.to_owned()),
          });
        }
      }
      Event::End(ref e) if e.name().as_ref() == b"palette" => break,
      _ => {}
    }
    buf.clear();
    counter += 1;
  }

  if palette_size.is_some_and(|x| x != palette.len()) {
    log::warn!("The specified palette size does not match the actual palette size");
  }

  Ok((fabric, palette))
}

fn write_palette<W: io::Write>(
  writer: &mut Writer<W>,
  fabric: &Fabric,
  palette: &[PaletteItem],
  default_symbol_font: &str,
) -> io::Result<()> {
  writer.create_element("palette").write_inner_content(|writer| {
    writer
      .create_element("palette_item")
      .with_attributes([
        ("index", "0"),
        ("name", fabric.name.as_str()),
        ("color", fabric.color.as_str()),
        ("kind", fabric.kind.as_str()),
      ])
      .write_empty()?;

    for (index, palitem) in palette.iter().enumerate() {
      let mut attributes = vec![
        ("index", (index + 1).to_string()),
        (
          "number",
          format!("{} {}", palitem.brand, palitem.number).trim().to_owned(),
        ),
        ("name", palitem.name.clone()),
        ("color", palitem.color.clone()),
        (
          "fontname",
          palitem.symbol_font.as_deref().unwrap_or(default_symbol_font).to_owned(),
        ),
      ];

      if let Some(s) = &palitem.symbol {
        attributes.push(("symbol", s.to_string()));
      }

      let element = writer
        .create_element("palette_item")
        .with_attributes(attributes.iter().map(|(key, value)| (*key, value.as_str())));

      if let Some(blends) = &palitem.blends {
        element.write_inner_content(|writer| {
          for blend in blends.iter() {
            let number = format!("{} {}", blend.brand, blend.number);
            writer
              .create_element("blend")
              .with_attributes([("number", number.trim())])
              .write_empty()?;
          }
          Ok(())
        })?;
      } else {
        element.write_empty()?;
      }
    }

    Ok(())
  })?;

  Ok(())
}

fn read_full_stitches<R: io::BufRead>(reader: &mut Reader<R>) -> Result<Vec<FullStitch>> {
  let mut fullstitches = Vec::new();

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) if e.name().as_ref() == b"stitch" => {
        let attributes = AttributesMap::try_from(e.attributes())?;

        fullstitches.push(FullStitch {
          x: unwrap_or_continue!(attributes.get_coord("x")),
          y: unwrap_or_continue!(attributes.get_coord("y")),
          palindex: unwrap_or_continue!(attributes.get_palindex("palindex")),
          kind: FullStitchKind::Full,
        });
      }
      Event::End(ref e) if e.name().as_ref() == b"fullstitches" => break,
      _ => {}
    }
    buf.clear();
  }

  Ok(fullstitches)
}

fn write_full_stitches<W: io::Write>(writer: &mut Writer<W>, fullstitches: &Stitches<FullStitch>) -> io::Result<()> {
  writer.create_element("fullstitches").write_inner_content(|writer| {
    for fullstitch in fullstitches.iter().filter(|stitch| stitch.kind == FullStitchKind::Full) {
      writer
        .create_element("stitch")
        .with_attributes([
          ("x", fullstitch.x.to_string().as_str()),
          ("y", fullstitch.y.to_string().as_str()),
          ("palindex", (fullstitch.palindex + 1).to_string().as_str()),
        ])
        .write_empty()?;
    }
    Ok(())
  })?;

  Ok(())
}

fn read_part_stitches<R: io::BufRead>(reader: &mut Reader<R>) -> Result<Vec<PartStitch>> {
  let mut partstitches = Vec::new();

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) if e.name().as_ref() == b"partstitch" => {
        let attributes = AttributesMap::try_from(e.attributes())?;

        let x = unwrap_or_continue!(attributes.get_coord("x"));
        let y = unwrap_or_continue!(attributes.get_coord("y"));

        let palindex1 = attributes.get_palindex("palindex1");
        let palindex2 = attributes.get_palindex("palindex2");

        let direction_value: u8 = unwrap_or_continue!(attributes.get_parsed("direction"));

        match direction_value {
          // Three-quarter stitches
          1 | 2 => {
            // Add half stitch.
            {
              let palindex = unwrap_or_continue!(palindex1.or(palindex2));
              let direction = if direction_value == 2 {
                PartStitchDirection::Forward
              } else {
                PartStitchDirection::Backward
              };

              partstitches.push(PartStitch {
                x,
                y,
                palindex,
                direction,
                kind: PartStitchKind::Half,
              });
            };

            // Add quarter stitch.
            {
              let direction = if direction_value == 1 {
                PartStitchDirection::Forward
              } else {
                PartStitchDirection::Backward
              };

              if let Some(palindex) = palindex1 {
                let (x, y) = if direction_value == 2 {
                  (x, y) // top-left
                } else {
                  (x, Coord::new(y + 0.5)?) // bottom-left
                };

                partstitches.push(PartStitch {
                  x,
                  y,
                  palindex,
                  direction,
                  kind: PartStitchKind::Quarter,
                });
              }

              if let Some(palindex) = palindex2 {
                let (x, y) = if direction_value == 1 {
                  (Coord::new(x + 0.5)?, y) // top-right
                } else {
                  (Coord::new(x + 0.5)?, Coord::new(y + 0.5)?) // bottom-right
                };

                partstitches.push(PartStitch {
                  x,
                  y,
                  palindex,
                  direction,
                  kind: PartStitchKind::Quarter,
                });
              }
            };
          }
          // Half stitches
          3 | 4 => {
            let palindex = unwrap_or_continue!(palindex1);
            let direction = if direction_value == 3 {
              PartStitchDirection::Forward
            } else {
              PartStitchDirection::Backward
            };

            partstitches.push(PartStitch {
              x,
              y,
              palindex,
              direction,
              kind: PartStitchKind::Half,
            });
          }
          _ => {
            log::warn!("Unknown partstitch direction: {direction_value}");
          }
        }
      }
      Event::End(ref e) if e.name().as_ref() == b"partstitches" => break,
      _ => {}
    }
    buf.clear();
  }

  Ok(partstitches)
}

fn read_line_stitches<R: io::BufRead>(reader: &mut Reader<R>) -> Result<Vec<LineStitch>> {
  let mut linestitches = Vec::new();

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) if e.name().as_ref() == b"backstitch" => {
        let attributes = AttributesMap::try_from(e.attributes())?;
        if let Some(OxsLineStitch::LineStitch(stitch)) = read_line_stitch(attributes)? {
          linestitches.push(stitch);
        }
      }
      Event::End(ref e) if e.name().as_ref() == b"backstitches" => break,
      _ => {}
    }
    buf.clear();
  }

  Ok(linestitches)
}

enum OxsLineStitch {
  LineStitch(LineStitch),
  CurvedStitch(CurvedStitch),
}

fn read_line_stitch(attributes: AttributesMap) -> Result<Option<OxsLineStitch>> {
  let palindex = unwrap_or_continue!(attributes.get_palindex("palindex"), Ok(None));
  let kind = unwrap_or_continue!(attributes.get_objecttype("objecttype"), Ok(None));

  let stitch = match kind.as_str() {
    "backstitch" | "straightstitch" => {
      let x1 = unwrap_or_continue!(attributes.get_coord("x1"), Ok(None));
      let x2 = unwrap_or_continue!(attributes.get_coord("x2"), Ok(None));

      let y1 = unwrap_or_continue!(attributes.get_coord("y1"), Ok(None));
      let y2 = unwrap_or_continue!(attributes.get_coord("y2"), Ok(None));

      Some(OxsLineStitch::LineStitch(LineStitch {
        x: (x1, x2),
        y: (y1, y2),
        palindex,
        kind: kind.parse()?,
      }))
    }
    "curvedstitch" => {
      let mut points = Vec::new();

      let mut i = 1;
      loop {
        let x = attributes.get_coord(format!("x{i}").as_str());
        let y = attributes.get_coord(format!("y{i}").as_str());

        if x.is_none() || y.is_none() {
          break;
        }

        i += 1;
        points.push((x.unwrap(), y.unwrap()));
      }

      Some(OxsLineStitch::CurvedStitch(CurvedStitch { points }))
    }
    _ => None,
  };

  Ok(stitch)
}

fn write_line_stitches<W: io::Write>(writer: &mut Writer<W>, linestitches: &Stitches<LineStitch>) -> io::Result<()> {
  writer.create_element("backstitches").write_inner_content(|writer| {
    for linestitch in linestitches.iter().cloned() {
      write_line_stitch(writer, OxsLineStitch::LineStitch(linestitch))?;
    }
    Ok(())
  })?;

  Ok(())
}

fn write_line_stitch<W: io::Write>(writer: &mut Writer<W>, stitch: OxsLineStitch) -> io::Result<()> {
  match stitch {
    OxsLineStitch::LineStitch(linestitch) => {
      writer
        .create_element("backstitch")
        .with_attributes([
          ("x1", linestitch.x.0.to_string().as_str()),
          ("x2", linestitch.x.1.to_string().as_str()),
          ("y1", linestitch.y.0.to_string().as_str()),
          ("y2", linestitch.y.1.to_string().as_str()),
          ("palindex", (linestitch.palindex + 1).to_string().as_str()),
          ("objecttype", linestitch.kind.to_string().as_str()),
        ])
        .write_empty()?;
    }
    OxsLineStitch::CurvedStitch(curvedstitch) => {
      let attributes = curvedstitch
        .points
        .clone()
        .into_iter()
        .enumerate()
        .flat_map(|(i, (x, y))| {
          [
            (format!("x{}", i + 1), x.to_string()),
            (format!("y{}", i + 1), y.to_string()),
          ]
        })
        .collect::<Vec<_>>();

      writer
        .create_element("backstitch")
        .with_attributes(
          [
            attributes
              .iter()
              .map(|(key, value)| (key.as_str(), value.as_str()))
              .collect::<Vec<_>>(),
            vec![("palindex", 1.to_string().as_str()), ("objecttype", "curvedstitch")],
          ]
          .concat(),
        )
        .write_empty()?;
    }
  }

  Ok(())
}

#[allow(clippy::type_complexity)]
fn read_ornaments<R: io::BufRead>(
  reader: &mut Reader<R>,
) -> Result<(Vec<FullStitch>, Vec<PartStitch>, Vec<NodeStitch>, Vec<SpecialStitch>)> {
  let mut fullstitches = Vec::new();
  let mut partstitches = Vec::new();
  let mut nodestitches = Vec::new();
  let mut specialstitches = Vec::new();

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) if e.name().as_ref() == b"object" => {
        let attributes = AttributesMap::try_from(e.attributes())?;
        match read_ornament(attributes)? {
          Some(OxsOrnament::Full(stitch)) => fullstitches.push(stitch),
          Some(OxsOrnament::Part(stitch)) => partstitches.push(stitch),
          Some(OxsOrnament::Node(stitch)) => nodestitches.push(stitch),
          Some(OxsOrnament::Special(stitch)) => specialstitches.push(stitch),
          None => {}
        };
      }
      Event::End(ref e) if e.name().as_ref() == b"ornaments_inc_knots_and_beads" => break,
      _ => {}
    }
    buf.clear();
  }

  Ok((fullstitches, partstitches, nodestitches, specialstitches))
}

enum OxsOrnament {
  Full(FullStitch),
  Part(PartStitch),
  Node(NodeStitch),
  Special(SpecialStitch),
}

fn read_ornament(attributes: AttributesMap) -> Result<Option<OxsOrnament>> {
  let x = unwrap_or_continue!(attributes.get_coord("x1"), Ok(None));
  let y = unwrap_or_continue!(attributes.get_coord("y1"), Ok(None));

  let palindex = unwrap_or_continue!(attributes.get_palindex("palindex"), Ok(None));
  let kind = unwrap_or_continue!(attributes.get_objecttype("objecttype"), Ok(None));

  if kind == "quarter" {
    let is_petit = attributes.get_bool("petit");
    if is_petit.is_none_or(|v| v) {
      return Ok(Some(OxsOrnament::Full(FullStitch {
        x,
        y,
        palindex,
        kind: FullStitchKind::Petite,
      })));
    } else {
      let (x_fract, y_fract) = (x.fract(), y.fract());
      let direction = if x_fract == 0.0 && y_fract == 0.0 || x_fract == 0.5 && y_fract == 0.5 {
        PartStitchDirection::Backward
      } else {
        PartStitchDirection::Forward
      };
      return Ok(Some(OxsOrnament::Part(PartStitch {
        x,
        y,
        palindex,
        direction,
        kind: PartStitchKind::Quarter,
      })));
    }
  }

  if kind == "tent" {
    let direction = match attributes.get_parsed("direction") {
      Some(1) => PartStitchDirection::Backward,
      Some(2) => PartStitchDirection::Forward,
      _ => PartStitchDirection::Forward,
    };
    return Ok(Some(OxsOrnament::Part(PartStitch {
      x,
      y,
      palindex,
      direction,
      kind: PartStitchKind::Half,
    })));
  }

  if kind == "specialstitch" {
    let modindex: u32 = unwrap_or_continue!(attributes.get_parsed("modindex"), Ok(None));

    return Ok(Some(OxsOrnament::Special(SpecialStitch {
      x,
      y,
      width: attributes.get_parsed("width").unwrap_or_default(),
      height: attributes.get_parsed("height").unwrap_or_default(),
      palindex,
      modindex,
      rotation: attributes.get_parsed("rotation").unwrap_or_default(),
      flip: (
        attributes.get_bool("flip_x").unwrap_or_default(),
        attributes.get_bool("flip_y").unwrap_or_default(),
      ),
    })));
  }

  if kind.starts_with("bead") || kind == "knot" {
    return Ok(Some(OxsOrnament::Node(NodeStitch {
      x,
      y,
      rotated: attributes.get_bool("rotated").unwrap_or_default(),
      palindex,
      kind: kind.parse()?,
    })));
  }

  Ok(None)
}

fn write_ornaments<W: io::Write>(
  writer: &mut Writer<W>,
  fullstitches: &Stitches<FullStitch>,
  partstitches: &Stitches<PartStitch>,
  nodestitches: &Stitches<NodeStitch>,
  specialstitches: &Stitches<SpecialStitch>,
) -> io::Result<()> {
  writer
    .create_element("ornaments_inc_knots_and_beads")
    .write_inner_content(|writer| {
      for fullstitch in fullstitches
        .iter()
        .filter(|stitch| stitch.kind == FullStitchKind::Petite)
        .cloned()
      {
        write_ornament(writer, OxsOrnament::Full(fullstitch))?;
      }

      for partstitch in partstitches.iter().cloned() {
        write_ornament(writer, OxsOrnament::Part(partstitch))?;
      }

      for nodestitch in nodestitches.iter().cloned() {
        write_ornament(writer, OxsOrnament::Node(nodestitch))?;
      }

      for specialstitch in specialstitches.iter().cloned() {
        write_ornament(writer, OxsOrnament::Special(specialstitch))?;
      }

      Ok(())
    })?;

  Ok(())
}

fn write_ornament<W: io::Write>(writer: &mut Writer<W>, stitch: OxsOrnament) -> io::Result<()> {
  match stitch {
    OxsOrnament::Full(stitch) => {
      writer
        .create_element("object")
        .with_attributes([
          ("x1", stitch.x.to_string().as_str()),
          ("y1", stitch.y.to_string().as_str()),
          ("palindex", (stitch.palindex + 1).to_string().as_str()),
          ("objecttype", "quarter"),
          ("petit", "true"),
        ])
        .write_empty()?;
    }
    OxsOrnament::Part(stitch) => match stitch.kind {
      PartStitchKind::Half => {
        let direction = match stitch.direction {
          PartStitchDirection::Forward => 2,
          PartStitchDirection::Backward => 1,
        };
        writer
          .create_element("object")
          .with_attributes([
            ("x1", stitch.x.to_string().as_str()),
            ("y1", stitch.y.to_string().as_str()),
            ("palindex", (stitch.palindex + 1).to_string().as_str()),
            ("objecttype", "tent"),
            ("direction", direction.to_string().as_str()),
          ])
          .write_empty()?;
      }
      PartStitchKind::Quarter => {
        writer
          .create_element("object")
          .with_attributes([
            ("x1", stitch.x.to_string().as_str()),
            ("y1", stitch.y.to_string().as_str()),
            ("palindex", (stitch.palindex + 1).to_string().as_str()),
            ("objecttype", "quarter"),
            ("petit", "false"),
          ])
          .write_empty()?;
      }
    },
    OxsOrnament::Node(stitch) => {
      writer
        .create_element("object")
        .with_attributes([
          ("x1", stitch.x.to_string().as_str()),
          ("y1", stitch.y.to_string().as_str()),
          ("palindex", (stitch.palindex + 1).to_string().as_str()),
          ("objecttype", stitch.kind.to_string().as_str()),
          ("rotated", stitch.rotated.to_string().as_str()),
        ])
        .write_empty()?;
    }
    OxsOrnament::Special(stitch) => {
      writer
        .create_element("object")
        .with_attributes([
          ("x1", stitch.x.to_string().as_str()),
          ("y1", stitch.y.to_string().as_str()),
          ("width", stitch.width.to_string().as_str()),
          ("height", stitch.height.to_string().as_str()),
          ("palindex", (stitch.palindex + 1).to_string().as_str()),
          ("objecttype", "specialstitch"),
          ("modindex", stitch.modindex.to_string().as_str()),
          ("rotation", stitch.rotation.to_string().as_str()),
          ("flip_x", stitch.flip.0.to_string().as_str()),
          ("flip_y", stitch.flip.1.to_string().as_str()),
        ])
        .write_empty()?;
    }
  }

  Ok(())
}

fn read_special_stitch_models<R: io::BufRead>(reader: &mut Reader<R>) -> Result<Vec<SpecialStitchModel>> {
  let mut special_stitch_models = Vec::new();

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) if e.name().as_ref() == b"model" => {
        let attributes = AttributesMap::try_from(e.attributes())?;

        let mut linestitches = Vec::new();
        let mut nodestitches = Vec::new();
        let mut curvedstitches = Vec::new();
        loop {
          match reader.read_event_into(&mut buf)? {
            Event::Start(ref e) if e.name().as_ref() == b"backstitch" => {
              let attributes = AttributesMap::try_from(e.attributes())?;
              match read_line_stitch(attributes)? {
                Some(OxsLineStitch::LineStitch(stitch)) => linestitches.push(stitch),
                Some(OxsLineStitch::CurvedStitch(stitch)) => curvedstitches.push(stitch),
                None => {}
              };
            }
            Event::Start(ref e) if e.name().as_ref() == b"object" => {
              let attributes = AttributesMap::try_from(e.attributes())?;
              if let Some(OxsOrnament::Node(stitch)) = read_ornament(attributes)? {
                nodestitches.push(stitch);
              }
            }
            Event::End(ref e) if e.name().as_ref() == b"model" => {
              special_stitch_models.push(SpecialStitchModel {
                unique_name: attributes.get("unique_name").unwrap_or_default().to_string(),
                name: attributes.get("name").unwrap_or_default().to_string(),
                width: attributes.get_parsed("width").unwrap_or_default(),
                height: attributes.get_parsed("height").unwrap_or_default(),
                linestitches,
                nodestitches,
                curvedstitches,
              });
              break;
            }
            _ => {}
          }
        }
      }
      Event::End(ref e) if e.name().as_ref() == b"special_stitch_models" => break,
      _ => {}
    }
  }

  Ok(special_stitch_models)
}

fn write_special_stitch_models<W: io::Write>(
  writer: &mut Writer<W>,
  special_stitch_models: &[SpecialStitchModel],
) -> io::Result<()> {
  writer
    .create_element("special_stitch_models")
    .write_inner_content(|writer| {
      for (index, spsmodel) in special_stitch_models.iter().enumerate() {
        writer
          .create_element("model")
          .with_attributes([
            ("index", (index).to_string().as_str()),
            ("unique_name", spsmodel.unique_name.as_str()),
            ("name", spsmodel.name.as_str()),
            ("width", spsmodel.width.to_string().as_str()),
            ("height", spsmodel.height.to_string().as_str()),
          ])
          .write_inner_content(|writer| {
            for linestitch in spsmodel.linestitches.iter().cloned() {
              write_line_stitch(writer, OxsLineStitch::LineStitch(linestitch))?;
            }

            for nodestitch in spsmodel.nodestitches.iter().cloned() {
              write_ornament(writer, OxsOrnament::Node(nodestitch))?;
            }

            for curvedstitch in spsmodel.curvedstitches.iter().cloned() {
              write_line_stitch(writer, OxsLineStitch::CurvedStitch(curvedstitch))?;
            }

            Ok(())
          })?;
      }

      Ok(())
    })?;

  Ok(())
}

// These are the functions to read and write Embroidery Studio custom sections.

pub fn parse_display_settings(file_path: std::path::PathBuf) -> Result<DisplaySettings> {
  let mut reader = Reader::from_file(&file_path)?;
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

pub fn parse_publish_settings(file_path: std::path::PathBuf) -> Result<PublishSettings> {
  let mut reader = Reader::from_file(&file_path)?;
  let reader_config = reader.config_mut();
  reader_config.expand_empty_elements = true;
  reader_config.check_end_names = true;
  reader_config.trim_text(true);

  let mut buf = Vec::new();
  let publish_settings = loop {
    match reader
      .read_event_into(&mut buf)
      .map_err(|e| anyhow::anyhow!("Error at position {}: {e:?}", reader.error_position()))?
    {
      Event::Start(ref e) if e.name().as_ref() == b"publish_settings" => {
        break parse_publish_settings_inner(&mut reader)?;
      }
      Event::Eof => anyhow::bail!("Unexpected EOF. It seems that the `publish_settings` tag is not found."),
      _ => {}
    }
    buf.clear();
  };

  Ok(publish_settings)
}

fn parse_publish_settings_inner<R: io::BufRead>(reader: &mut Reader<R>) -> Result<PublishSettings> {
  let mut publish_settings = PublishSettings::default();

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      #[allow(clippy::single_match)]
      Event::Start(ref e) => match e.name().as_ref() {
        b"pdf" => {
          let pdf_attributes = AttributesMap::try_from(e.attributes())?;
          publish_settings.pdf = read_pdf_export_options(reader, pdf_attributes)?;
        }
        _ => {}
      },
      Event::End(ref e) if e.name().as_ref() == b"publish_settings" => break,
      Event::Eof => anyhow::bail!("Unexpected EOF. The end of the `publish_settings` tag is not found."),
      _ => {}
    }
    buf.clear();
  }

  Ok(publish_settings)
}

pub fn save_publish_settings_to_vec(publish_settings: &PublishSettings) -> Result<Vec<u8>> {
  // In the development mode, we want to have a pretty-printed XML file for easy debugging.
  #[cfg(debug_assertions)]
  let mut writer = Writer::new_with_indent(Vec::new(), b' ', 2);
  #[cfg(not(debug_assertions))]
  let mut writer = Writer::new(Vec::new());

  writer.write_event(Event::Decl(BytesDecl::new("1.0", Some("UTF-8"), None)))?;
  writer
    .create_element("publish_settings")
    .write_inner_content(|writer| {
      write_pdf_export_options(writer, &publish_settings.pdf)?;
      Ok(())
    })?;

  Ok(writer.into_inner())
}

fn read_pdf_export_options<R: io::BufRead>(
  reader: &mut Reader<R>,
  attributes: AttributesMap,
) -> Result<PdfExportOptions> {
  let mut pdf = PdfExportOptions {
    monochrome: attributes.get_bool("monochrome").unwrap_or_default(),
    color: attributes.get_bool("color").unwrap_or_default(),
    center_frames: attributes.get_bool("center_frames").unwrap_or_default(),
    enumerate_frames: attributes.get_bool("enumerate_frames").unwrap_or_default(),
    ..Default::default()
  };

  let mut buf = Vec::new();
  loop {
    #[allow(clippy::single_match)]
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) => match e.name().as_ref() {
        b"frame_options" => {
          let attributes = AttributesMap::try_from(e.attributes())?;
          pdf.frame_options = read_image_export_options(attributes)?;
        }
        _ => {}
      },
      Event::End(ref e) if e.name().as_ref() == b"pdf" => break,
      _ => {}
    }
    buf.clear();
  }

  Ok(pdf)
}

fn write_pdf_export_options<W: io::Write>(writer: &mut Writer<W>, pdf: &PdfExportOptions) -> io::Result<()> {
  writer
    .create_element("pdf")
    .with_attributes([
      ("monochrome", pdf.monochrome.to_string().as_str()),
      ("color", pdf.color.to_string().as_str()),
      ("center_frames", pdf.center_frames.to_string().as_str()),
      ("enumerate_frames", pdf.enumerate_frames.to_string().as_str()),
    ])
    .write_inner_content(|writer| {
      write_image_export_options(writer, "frame_options", &pdf.frame_options)?;
      Ok(())
    })?;
  Ok(())
}

fn read_image_export_options(attributes: AttributesMap) -> Result<ImageExportOptions> {
  let image = ImageExportOptions {
    frame_size: if let Some(frame_width) = attributes.get_parsed("frame_width") {
      let frame_height = attributes.get_parsed("frame_height").unwrap_or(frame_width);
      Some((frame_width, frame_height))
    } else {
      None
    },
    cell_size: attributes
      .get_parsed("cell_size")
      .unwrap_or(ImageExportOptions::DEFAULT_CELL_SIZE),
    preserved_overlap: attributes.get_parsed("preserved_overlap"),
    show_grid_line_numbers: attributes.get_bool("show_grid_line_numbers").unwrap_or_default(),
    show_centering_marks: attributes.get_bool("show_centering_marks").unwrap_or_default(),
  };

  Ok(image)
}

fn write_image_export_options<W: io::Write>(
  writer: &mut Writer<W>,
  element: &str,
  image: &ImageExportOptions,
) -> io::Result<()> {
  let mut attributes = Vec::new();

  if let Some(frame_size) = image.frame_size {
    attributes.push(("frame_width", frame_size.0.to_string()));
    attributes.push(("frame_height", frame_size.1.to_string()));
  }
  attributes.push(("cell_size", image.cell_size.to_string()));

  if let Some(preserved_overlap) = image.preserved_overlap {
    attributes.push(("preserved_overlap", preserved_overlap.to_string()));
  }

  attributes.push(("show_grid_line_numbers", image.show_grid_line_numbers.to_string()));
  attributes.push(("show_centering_marks", image.show_centering_marks.to_string()));

  let attributes = attributes.iter().map(|(k, v)| (*k, v.as_str())).collect::<Vec<_>>();
  writer
    .create_element(element)
    .with_attributes(attributes)
    .write_empty()?;

  Ok(())
}
