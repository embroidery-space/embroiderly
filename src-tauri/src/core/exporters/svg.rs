use std::io;

use quick_xml::Writer;
use quick_xml::events::{BytesDecl, BytesText, Event};

use crate::core::pattern::*;

#[cfg(test)]
#[path = "svg.test.rs"]
mod tests;

pub fn export_pattern(patproj: &PatternProject, cell_size: f32) -> io::Result<Vec<u8>> {
  let mut buffer = Vec::new();

  // In the development mode, we want to have a pretty-printed XML file for easy debugging.
  #[cfg(debug_assertions)]
  let mut writer = Writer::new_with_indent(&mut buffer, b' ', 2);
  #[cfg(not(debug_assertions))]
  let mut writer = Writer::new(&mut buffer);

  let PatternProject { pattern, display_settings, .. } = patproj;

  let width = (pattern.fabric.width as f32) * cell_size;
  let height = (pattern.fabric.height as f32) * cell_size;

  writer.write_event(Event::Decl(BytesDecl::new("1.0", Some("UTF-8"), None)))?;
  writer
    .create_element("svg")
    .with_attributes([
      ("width", format!("{}px", width).as_str()),
      ("height", format!("{}px", height).as_str()),
      ("viewBox", format!("0 0 {} {}", width, height).as_str()),
      ("xmlns", "http://www.w3.org/2000/svg"),
    ])
    .write_inner_content(|writer| {
      write_full_stitches(
        writer,
        &pattern.palette,
        &pattern.fullstitches,
        &display_settings.default_symbol_font,
        cell_size,
      )?;
      write_part_stitches(
        writer,
        &pattern.palette,
        &pattern.partstitches,
        &display_settings.default_symbol_font,
        cell_size,
      )?;
      write_grid(
        writer,
        pattern.fabric.width,
        pattern.fabric.height,
        &display_settings.grid,
        cell_size,
      )?;
      // TODO: special stitches
      write_line_stitches(writer, &pattern.palette, &pattern.linestitches, cell_size)?;
      write_node_stitches(writer, &pattern.palette, &pattern.nodestitches, cell_size)?;
      Ok(())
    })?;

  Ok(buffer)
}

macro_rules! write_stitch_symbol {
  ($writer:expr, $x:expr, $y:expr, $symbol:expr, $symbol_font:expr, $font_size:expr) => {{
    if let Some(symbol) = $symbol.as_ref().map(|s| s.render()) {
      $writer
        .create_element("text")
        .with_attributes([
          ("x", $x.to_string().as_str()),
          ("y", $y.to_string().as_str()),
          ("font-size", $font_size.to_string().as_str()),
          ("font-family", $symbol_font),
          ("text-anchor", "middle"),
          ("dominant-baseline", "middle"),
        ])
        .write_text_content(BytesText::new(&symbol))?;
    }
  }};
}

fn write_full_stitches<W: io::Write>(
  writer: &mut Writer<W>,
  palette: &[PaletteItem],
  fullstitches: &Stitches<FullStitch>,
  default_symbol_font: &str,
  cell_size: f32,
) -> io::Result<()> {
  writer
    .create_element("g")
    .with_attribute(("id", "fullstitches"))
    .write_inner_content(|writer| {
      for stitch in fullstitches.iter() {
        let palitem = palette.get(stitch.palindex as usize).unwrap();

        let x = stitch.x * cell_size;
        let y = stitch.y * cell_size;

        writer
          .create_element("g")
          .with_attribute(("transform", format!("translate({}, {})", x, y).as_str()))
          .write_inner_content(|writer| {
            let size = match stitch.kind {
              FullStitchKind::Full => cell_size,
              FullStitchKind::Petite => cell_size / 2.0,
            };

            writer
              .create_element("rect")
              .with_attributes([
                ("x", "0"),
                ("y", "0"),
                ("width", size.to_string().as_str()),
                ("height", size.to_string().as_str()),
                ("fill", format!("#{}", palitem.color).as_str()),
                ("stroke", "#000000"),
              ])
              .write_empty()?;

            let font_size = size * 0.8;
            write_stitch_symbol!(
              writer,
              size / 2.0,
              size / 2.0,
              palitem.symbol,
              palitem.symbol_font.as_deref().unwrap_or(default_symbol_font),
              font_size
            );

            Ok(())
          })?;
      }
      Ok(())
    })?;
  Ok(())
}

fn write_part_stitches<W: io::Write>(
  writer: &mut Writer<W>,
  palette: &[PaletteItem],
  partstitches: &Stitches<PartStitch>,
  default_symbol_font: &str,
  cell_size: f32,
) -> io::Result<()> {
  writer
    .create_element("g")
    .with_attribute(("id", "partstitches"))
    .write_inner_content(|writer| {
      for stitch in partstitches.iter() {
        let palitem = palette.get(stitch.palindex as usize).unwrap();

        let x = stitch.x * cell_size;
        let y = stitch.y * cell_size;

        writer
          .create_element("g")
          .with_attribute(("transform", format!("translate({}, {})", x, y).as_str()))
          .write_inner_content(|writer| {
            let points = match stitch.kind {
              PartStitchKind::Half => match stitch.direction {
                PartStitchDirection::Forward => vec![
                  (1.0, 0.0),
                  (1.0, 0.35),
                  (0.35, 1.0),
                  (0.0, 1.0),
                  (0.0, 0.65),
                  (0.65, 0.0),
                ],
                PartStitchDirection::Backward => vec![
                  (0.0, 0.0),
                  (0.35, 0.0),
                  (1.0, 0.65),
                  (1.0, 1.0),
                  (0.65, 1.0),
                  (0.0, 0.35),
                ],
              },
              PartStitchKind::Quarter => match stitch.direction {
                PartStitchDirection::Forward => vec![
                  (0.5, 0.0),
                  (0.5, 0.25),
                  (0.25, 0.5),
                  (0.0, 0.5),
                  (0.0, 0.25),
                  (0.25, 0.0),
                ],

                PartStitchDirection::Backward => vec![
                  (0.0, 0.0),
                  (0.0, 0.25),
                  (0.25, 0.5),
                  (0.5, 0.5),
                  (0.5, 0.25),
                  (0.25, 0.0),
                ],
              },
            };
            let points = points
              .iter()
              .map(|(x, y)| format!("{},{}", x * cell_size, y * cell_size,))
              .collect::<Vec<_>>()
              .join(" ");

            writer
              .create_element("polygon")
              .with_attributes([
                ("points", points.as_str()),
                ("fill", format!("#{}", palitem.color).as_str()),
                ("stroke", "#000000"),
              ])
              .write_empty()?;

            let size = cell_size / 2.0;
            let font_size = size * 0.8;

            match stitch.kind {
              PartStitchKind::Half => match stitch.direction {
                PartStitchDirection::Forward => {
                  write_stitch_symbol!(
                    writer,
                    size + size / 2.0,
                    size / 2.0,
                    palitem.symbol,
                    palitem.symbol_font.as_deref().unwrap_or(default_symbol_font),
                    font_size
                  );
                  write_stitch_symbol!(
                    writer,
                    size / 2.0,
                    size + size / 2.0,
                    palitem.symbol,
                    palitem.symbol_font.as_deref().unwrap_or(default_symbol_font),
                    font_size
                  );
                }
                PartStitchDirection::Backward => {
                  write_stitch_symbol!(
                    writer,
                    size / 2.0,
                    size / 2.0,
                    palitem.symbol,
                    palitem.symbol_font.as_deref().unwrap_or(default_symbol_font),
                    font_size
                  );
                  write_stitch_symbol!(
                    writer,
                    size + size / 2.0,
                    size + size / 2.0,
                    palitem.symbol,
                    palitem.symbol_font.as_deref().unwrap_or(default_symbol_font),
                    font_size
                  );
                }
              },
              PartStitchKind::Quarter => {
                write_stitch_symbol!(
                  writer,
                  size / 2.0,
                  size / 2.0,
                  palitem.symbol,
                  palitem.symbol_font.as_deref().unwrap_or(default_symbol_font),
                  font_size
                );
              }
            };

            Ok(())
          })?;
      }
      Ok(())
    })?;
  Ok(())
}

fn write_line_stitches<W: io::Write>(
  writer: &mut Writer<W>,
  palette: &[PaletteItem],
  linestitches: &Stitches<LineStitch>,
  cell_size: f32,
) -> io::Result<()> {
  writer
    .create_element("g")
    .with_attribute(("id", "linestitches"))
    .write_inner_content(|writer| {
      for stitch in linestitches.iter() {
        let palitem = palette.get(stitch.palindex as usize).unwrap();
        writer
          .create_element("line")
          .with_attributes([
            ("x1", (stitch.x.0 * cell_size).to_string().as_str()),
            ("y1", (stitch.y.0 * cell_size).to_string().as_str()),
            ("x2", (stitch.x.1 * cell_size).to_string().as_str()),
            ("y2", (stitch.y.1 * cell_size).to_string().as_str()),
            ("stroke", format!("#{}", palitem.color).as_str()),
            ("stroke-width", (0.2 * cell_size).to_string().as_str()),
            ("stroke-linecap", "round"),
          ])
          .write_empty()?;
      }
      Ok(())
    })?;
  Ok(())
}

fn write_node_stitches<W: io::Write>(
  writer: &mut Writer<W>,
  palette: &[PaletteItem],
  nodestitches: &Stitches<NodeStitch>,
  cell_size: f32,
) -> io::Result<()> {
  writer
    .create_element("g")
    .with_attribute(("id", "nodestitches"))
    .write_inner_content(|writer| {
      for stitch in nodestitches.iter() {
        let palitem = palette.get(stitch.palindex as usize).unwrap();
        writer
          .create_element("circle")
          .with_attributes([
            ("cx", (stitch.x * cell_size).to_string().as_str()),
            ("cy", (stitch.y * cell_size).to_string().as_str()),
            ("r", (0.25 * cell_size).to_string().as_str()),
            ("fill", format!("#{}", palitem.color).as_str()),
            ("stroke", "#000000"),
          ])
          .write_empty()?;
      }
      Ok(())
    })?;
  Ok(())
}

fn write_grid<W: io::Write>(
  writer: &mut Writer<W>,
  pattern_width_stitches: u16,
  pattern_height_stitches: u16,
  grid: &Grid,
  cell_size: f32,
) -> io::Result<()> {
  writer
    .create_element("g")
    .with_attribute(("id", "grid"))
    .write_inner_content(|writer| {
      let pattern_width = pattern_width_stitches as f32 * cell_size;
      let pattern_height = pattern_height_stitches as f32 * cell_size;

      let minor_lines_thickness = grid.minor_lines.thickness * cell_size;
      let major_lines_thickness = grid.major_lines.thickness * cell_size;

      // Draw horizontal minor lines.
      for y in 0..=pattern_height_stitches {
        let y = y as f32 * cell_size;
        writer
          .create_element("line")
          .with_attributes([
            ("x1", "0"),
            ("y1", y.to_string().as_str()),
            ("x2", pattern_width.to_string().as_str()),
            ("y2", y.to_string().as_str()),
            ("stroke", format!("#{}", grid.minor_lines.color).as_str()),
            ("stroke-width", minor_lines_thickness.to_string().as_str()),
          ])
          .write_empty()?;
      }

      // Draw vertical minor lines.
      for x in 0..=pattern_width_stitches {
        let x = x as f32 * cell_size;
        writer
          .create_element("line")
          .with_attributes([
            ("x1", x.to_string().as_str()),
            ("y1", "0"),
            ("x2", x.to_string().as_str()),
            ("y2", pattern_height.to_string().as_str()),
            ("stroke", format!("#{}", grid.minor_lines.color).as_str()),
            ("stroke-width", minor_lines_thickness.to_string().as_str()),
          ])
          .write_empty()?;
      }

      // Draw horizontal major lines.
      for y in (0..=pattern_height_stitches).step_by(grid.major_lines_interval as usize) {
        let y = y as f32 * cell_size;
        writer
          .create_element("line")
          .with_attributes([
            ("x1", "0"),
            ("y1", y.to_string().as_str()),
            ("x2", pattern_width.to_string().as_str()),
            ("y2", y.to_string().as_str()),
            ("stroke", format!("#{}", grid.major_lines.color).as_str()),
            ("stroke-width", major_lines_thickness.to_string().as_str()),
          ])
          .write_empty()?;
      }

      // Draw vertical major lines.
      for x in (0..=pattern_width_stitches).step_by(grid.major_lines_interval as usize) {
        let x = x as f32 * cell_size;
        writer
          .create_element("line")
          .with_attributes([
            ("x1", x.to_string().as_str()),
            ("y1", "0"),
            ("x2", x.to_string().as_str()),
            ("y2", pattern_height.to_string().as_str()),
            ("stroke", format!("#{}", grid.major_lines.color).as_str()),
            ("stroke-width", major_lines_thickness.to_string().as_str()),
          ])
          .write_empty()?;
      }

      Ok(())
    })?;
  Ok(())
}
