use std::io;

use embroiderly_pattern::*;
use quick_xml::Writer;
use quick_xml::events::{BytesDecl, BytesText, Event};

#[cfg(test)]
#[path = "svg.test.rs"]
mod tests;

pub fn generate_svg(
  patproj: &PatternProject,
  color: bool,
  options: ImageExportOptions,
) -> anyhow::Result<Vec<Vec<u8>>> {
  log::debug!("Generating SVG frames for the pattern");
  let mut frames = Vec::new();

  let (pattern_width, pattern_height) = (patproj.pattern.fabric.width, patproj.pattern.fabric.height);

  let cell_size = options.cell_size;
  let frame_size = options.frame_size.unwrap_or((pattern_width, pattern_height));
  let preserved_overlap = options
    .preserved_overlap
    .unwrap_or(ImageExportOptions::DEFAULT_PRESERVED_OVERLAP);

  // We continiously iterate by frames from the top-left corner of the pattern to the bottom-right corner.
  // So, if we have exceeded the pattern height, we stop.
  let mut current_position = (0, 0);
  while current_position.1 < pattern_height {
    // Get the current frame's bounds.
    let bounds = Bounds::new(
      current_position.0,
      current_position.1,
      frame_size.0.min(pattern_width.saturating_sub(current_position.0)),
      frame_size.1.min(pattern_height.saturating_sub(current_position.1)),
    );

    let fullstitches = patproj
      .pattern
      .fullstitches
      .get_stitches_in_bounds(bounds)
      .cloned()
      .map(|stitch| FullStitch {
        // Adjust coordinates to be relative to the current frame.
        x: Coord::new(stitch.x - current_position.0 as f32).unwrap(),
        y: Coord::new(stitch.y - current_position.1 as f32).unwrap(),
        ..stitch
      })
      .collect::<Vec<_>>();
    let partstitches = patproj
      .pattern
      .partstitches
      .get_stitches_in_bounds(bounds)
      .cloned()
      .map(|stitch| PartStitch {
        // Adjust coordinates to be relative to the current frame.
        x: Coord::new(stitch.x - current_position.0 as f32).unwrap(),
        y: Coord::new(stitch.y - current_position.1 as f32).unwrap(),
        ..stitch
      })
      .collect::<Vec<_>>();
    let linestitches = patproj
      .pattern
      .linestitches
      .get_stitches_in_bounds(bounds)
      .cloned()
      .map(|stitch| LineStitch {
        // Adjust coordinates to be relative to the current frame.
        x: (
          Coord::new(stitch.x.0 - current_position.0 as f32).unwrap(),
          Coord::new(stitch.x.1 - current_position.0 as f32).unwrap(),
        ),
        y: (
          Coord::new(stitch.y.0 - current_position.1 as f32).unwrap(),
          Coord::new(stitch.y.1 - current_position.1 as f32).unwrap(),
        ),
        ..stitch
      })
      .collect::<Vec<_>>();
    let nodestitches = patproj
      .pattern
      .nodestitches
      .get_stitches_in_bounds(bounds)
      .cloned()
      .map(|stitch| NodeStitch {
        // Adjust coordinates to be relative to the current frame.
        x: Coord::new(stitch.x - current_position.0 as f32).unwrap(),
        y: Coord::new(stitch.y - current_position.1 as f32).unwrap(),
        ..stitch
      })
      .collect::<Vec<_>>();
    let specialstitches = patproj
      .pattern
      .specialstitches
      .get_stitches_in_bounds(bounds)
      .cloned()
      .map(|stitch| SpecialStitch {
        // Adjust coordinates to be relative to the current frame.
        x: Coord::new(stitch.x - current_position.0 as f32).unwrap(),
        y: Coord::new(stitch.y - current_position.1 as f32).unwrap(),
        ..stitch
      })
      .collect::<Vec<_>>();

    let pattern_context = PatternContext {
      fabric: &patproj.pattern.fabric,
      palette: &patproj.pattern.palette,
      fullstitches: &fullstitches,
      partstitches: &partstitches,
      linestitches: &linestitches,
      nodestitches: &nodestitches,
      specialstitches: &specialstitches,
      special_stitch_models: &patproj.pattern.special_stitch_models,

      grid: &patproj.display_settings.grid,
      default_symbol_font: &patproj.display_settings.default_symbol_font,
    };
    let frame_context = FrameContext {
      color,
      bounds,
      cell_size,
      preserved_overlap,
      show_grid_line_numbers: options.show_grid_line_numbers,
      show_centering_marks: options.show_centering_marks,
    };
    frames.push(draw_frame(pattern_context, frame_context)?);

    // If we are not framing, we only need one frame.
    if options.frame_size.is_none() {
      break;
    }

    // Move to next frame position.
    current_position.0 += frame_size.0 - preserved_overlap;

    // If we have exceeded the row width, wrap to next row.
    if current_position.0 >= pattern_width {
      current_position.0 = 0;
      current_position.1 += frame_size.1 - preserved_overlap;
    }
  }

  log::debug!("Generated {} frames", frames.len());
  Ok(frames)
}

struct PatternContext<'a> {
  fabric: &'a Fabric,
  palette: &'a [PaletteItem],
  fullstitches: &'a [FullStitch],
  partstitches: &'a [PartStitch],
  linestitches: &'a [LineStitch],
  nodestitches: &'a [NodeStitch],
  specialstitches: &'a [SpecialStitch],
  special_stitch_models: &'a [SpecialStitchModel],

  grid: &'a Grid,
  default_symbol_font: &'a str,
}

#[derive(Clone, Copy)]
struct FrameContext {
  color: bool,
  bounds: Bounds,
  cell_size: f32,
  preserved_overlap: u16,
  show_grid_line_numbers: bool,
  show_centering_marks: bool,
}

fn draw_frame(pattern: PatternContext, frame: FrameContext) -> io::Result<Vec<u8>> {
  let mut buffer = Vec::new();

  // In the development mode, we want to have a pretty-printed XML file for easy debugging.
  #[cfg(debug_assertions)]
  let mut writer = Writer::new_with_indent(&mut buffer, b' ', 2);
  #[cfg(not(debug_assertions))]
  let mut writer = Writer::new(&mut buffer);

  // Add 2 stitches padding to the frame to correctly display edge stitches, grid line numbers and centering marks.
  let width = ((frame.bounds.width + 2) as f32) * frame.cell_size;
  let height = ((frame.bounds.height + 2) as f32) * frame.cell_size;

  writer.write_event(Event::Decl(BytesDecl::new("1.0", Some("UTF-8"), None)))?;
  writer
    .create_element("svg")
    .with_attributes([
      ("width", format!("{width}px").as_str()),
      ("height", format!("{height}px").as_str()),
      ("viewBox", format!("0 0 {width} {height}").as_str()),
      ("xmlns", "http://www.w3.org/2000/svg"),
    ])
    .write_inner_content(|writer| {
      writer
        .create_element("g")
        .with_attributes([
          ("id", "frame"),
          (
            "transform",
            format!("translate({}, {})", frame.cell_size, frame.cell_size).as_str(),
          ),
        ])
        .write_inner_content(|writer| {
          draw_full_stitches(
            writer,
            pattern.palette,
            pattern.fullstitches,
            pattern.default_symbol_font,
            frame,
          )?;
          draw_part_stitches(
            writer,
            pattern.palette,
            pattern.partstitches,
            pattern.default_symbol_font,
            frame,
          )?;
          draw_grid(writer, pattern.fabric, pattern.grid, frame)?;
          write_special_stitches(
            writer,
            pattern.palette,
            pattern.specialstitches,
            pattern.special_stitch_models,
            frame.cell_size,
          )?;
          draw_line_stitches(writer, pattern.palette, pattern.linestitches, frame.cell_size)?;
          draw_node_stitches(writer, pattern.palette, pattern.nodestitches, frame.cell_size)?;
          draw_overlapping_zones(writer, frame)?;
          Ok(())
        })?;
      Ok(())
    })?;

  Ok(buffer)
}

macro_rules! draw_stitch_symbol {
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

fn draw_full_stitches<W: io::Write>(
  writer: &mut Writer<W>,
  palette: &[PaletteItem],
  fullstitches: &[FullStitch],
  default_symbol_font: &str,
  frame: FrameContext,
) -> io::Result<()> {
  let FrameContext { color, cell_size, .. } = frame;

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
          .with_attribute(("transform", format!("translate({x}, {y})").as_str()))
          .write_inner_content(|writer| {
            let size = match stitch.kind {
              FullStitchKind::Full => cell_size,
              FullStitchKind::Petite => cell_size / 2.0,
            };

            let fill = if color {
              format!("#{}", palitem.color)
            } else {
              "none".to_string()
            };
            writer
              .create_element("rect")
              .with_attributes([
                ("x", "0"),
                ("y", "0"),
                ("width", size.to_string().as_str()),
                ("height", size.to_string().as_str()),
                ("fill", fill.as_str()),
                ("stroke", "#000000"),
              ])
              .write_empty()?;

            let font_size = size * 0.8;
            draw_stitch_symbol!(
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

fn draw_part_stitches<W: io::Write>(
  writer: &mut Writer<W>,
  palette: &[PaletteItem],
  partstitches: &[PartStitch],
  default_symbol_font: &str,
  frame: FrameContext,
) -> io::Result<()> {
  let FrameContext { color, cell_size, .. } = frame;

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
          .with_attribute(("transform", format!("translate({x}, {y})").as_str()))
          .write_inner_content(|writer| {
            let points = match stitch.kind {
              PartStitchKind::Half => match stitch.direction {
                PartStitchDirection::Forward => [
                  (1.0, 0.0),
                  (1.0, 0.35),
                  (0.35, 1.0),
                  (0.0, 1.0),
                  (0.0, 0.65),
                  (0.65, 0.0),
                ],
                PartStitchDirection::Backward => [
                  (0.0, 0.0),
                  (0.35, 0.0),
                  (1.0, 0.65),
                  (1.0, 1.0),
                  (0.65, 1.0),
                  (0.0, 0.35),
                ],
              },
              PartStitchKind::Quarter => match stitch.direction {
                PartStitchDirection::Forward => [
                  (0.5, 0.0),
                  (0.5, 0.25),
                  (0.25, 0.5),
                  (0.0, 0.5),
                  (0.0, 0.25),
                  (0.25, 0.0),
                ],

                PartStitchDirection::Backward => [
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
            let fill = if color {
              format!("#{}", palitem.color)
            } else {
              "none".to_string()
            };

            writer
              .create_element("polygon")
              .with_attributes([
                ("points", points.as_str()),
                ("fill", fill.as_str()),
                ("stroke", "#000000"),
              ])
              .write_empty()?;

            let size = cell_size / 2.0;
            let font_size = size * 0.8;
            match stitch.kind {
              PartStitchKind::Half => match stitch.direction {
                PartStitchDirection::Forward => {
                  draw_stitch_symbol!(
                    writer,
                    size + size / 2.0,
                    size / 2.0,
                    palitem.symbol,
                    palitem.symbol_font.as_deref().unwrap_or(default_symbol_font),
                    font_size
                  );
                  draw_stitch_symbol!(
                    writer,
                    size / 2.0,
                    size + size / 2.0,
                    palitem.symbol,
                    palitem.symbol_font.as_deref().unwrap_or(default_symbol_font),
                    font_size
                  );
                }
                PartStitchDirection::Backward => {
                  draw_stitch_symbol!(
                    writer,
                    size / 2.0,
                    size / 2.0,
                    palitem.symbol,
                    palitem.symbol_font.as_deref().unwrap_or(default_symbol_font),
                    font_size
                  );
                  draw_stitch_symbol!(
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
                draw_stitch_symbol!(
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

fn draw_line_stitches<W: io::Write>(
  writer: &mut Writer<W>,
  palette: &[PaletteItem],
  linestitches: &[LineStitch],
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

fn draw_curved_stitches<W: io::Write>(
  writer: &mut Writer<W>,
  palette: &[PaletteItem],
  curvedstitches: &[CurvedStitch],
  cell_size: f32,
) -> io::Result<()> {
  writer
    .create_element("g")
    .with_attribute(("id", "curvedstitches"))
    .write_inner_content(|writer| {
      for stitch in curvedstitches.iter() {
        let palitem = palette.first().unwrap();
        let points = stitch
          .points
          .iter()
          .map(|(x, y)| format!("{},{}", x * cell_size, y * cell_size))
          .collect::<Vec<_>>()
          .join(" ");
        writer
          .create_element("polyline")
          .with_attributes([
            ("points", points.as_str()),
            ("fill", "none"),
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

fn draw_node_stitches<W: io::Write>(
  writer: &mut Writer<W>,
  palette: &[PaletteItem],
  nodestitches: &[NodeStitch],
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

fn write_special_stitches<W: io::Write>(
  writer: &mut Writer<W>,
  palette: &[PaletteItem],
  specialstitches: &[SpecialStitch],
  special_stitch_models: &[SpecialStitchModel],
  cell_size: f32,
) -> io::Result<()> {
  writer
    .create_element("g")
    .with_attribute(("id", "specialstitches"))
    .write_inner_content(|writer| {
      for stitch in specialstitches.iter() {
        let palette = [palette.get(stitch.palindex as usize).unwrap().clone()];
        let model = special_stitch_models.get(stitch.modindex as usize).unwrap();

        let scale_x = if stitch.flip.0 { -1.0 } else { 1.0 };
        let scale_y = if stitch.flip.1 { -1.0 } else { 1.0 };

        writer
          .create_element("g")
          .with_attributes([(
            "transform",
            format!(
              "translate({}, {}) rotate({}) scale({}, {})",
              stitch.x * cell_size,
              stitch.y * cell_size,
              stitch.rotation,
              scale_x,
              scale_y
            )
            .as_str(),
          )])
          .write_inner_content(|writer| {
            draw_node_stitches(writer, &palette, &model.nodestitches, cell_size)?;
            draw_line_stitches(writer, &palette, &model.linestitches, cell_size)?;
            draw_curved_stitches(writer, &palette, &model.curvedstitches, cell_size)?;
            Ok(())
          })?;
      }
      Ok(())
    })?;
  Ok(())
}

fn draw_grid<W: io::Write>(
  writer: &mut Writer<W>,
  fabric: &Fabric,
  grid: &Grid,
  frame: FrameContext,
) -> io::Result<()> {
  let FrameContext {
    bounds,
    cell_size,
    preserved_overlap,
    show_grid_line_numbers,
    show_centering_marks,
    ..
  } = frame;

  writer
    .create_element("g")
    .with_attribute(("id", "grid"))
    .write_inner_content(|writer| {
      let pattern_width = bounds.width as f32 * cell_size;
      let pattern_height = bounds.height as f32 * cell_size;

      let minor_lines_thickness = grid.minor_lines.thickness * cell_size;
      let major_lines_thickness = grid.major_lines.thickness * cell_size;

      // Draw horizontal minor lines.
      for i in 0..=bounds.height {
        let y = i as f32 * cell_size;

        // Draw the line.
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

        // Draw centering marks if enabled.
        if show_centering_marks && i + bounds.y == fabric.height / 2 {
          let y = if (i + bounds.y) % 10 == 0 {
            y - cell_size / 2.0
          } else {
            y
          };

          draw_centering_marks(writer, -cell_size, y, CenteringMarkPosition::Left, cell_size)?;
          draw_centering_marks(writer, pattern_width, y, CenteringMarkPosition::Right, cell_size)?;
        }
      }

      // Draw vertical minor lines.
      for i in 0..=bounds.width {
        let x = i as f32 * cell_size;

        // Draw the line.
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

        // Draw centering marks if enabled.
        if show_centering_marks && i + bounds.x == fabric.width / 2 {
          let x = if (i + bounds.x) % 10 == 0 {
            x - cell_size / 2.0
          } else {
            x
          };

          draw_centering_marks(writer, x, -cell_size, CenteringMarkPosition::Top, cell_size)?;
          draw_centering_marks(writer, x, pattern_height, CenteringMarkPosition::Bottom, cell_size)?;
        }
      }

      // Draw horizontal major lines.
      for i in (0..=(bounds.y + bounds.height))
        .step_by(grid.major_lines_interval as usize)
        .filter(move |&y| {
          let treshhold = if bounds.y == 0 { 0 } else { bounds.y + preserved_overlap };
          y >= treshhold
        })
      {
        let y = ((i - bounds.y) as f32) * cell_size;

        // Draw the line.
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

        // Draw the line number if enabled.
        if show_grid_line_numbers {
          writer
            .create_element("text")
            .with_attributes([
              ("x", (-cell_size).to_string().as_str()),
              ("y", y.to_string().as_str()),
              ("font-size", (cell_size * 0.8).to_string().as_str()),
              ("font-weight", "bold"),
              ("text-anchor", "start"),
              ("dominant-baseline", "middle"),
            ])
            .write_text_content(BytesText::new(&i.to_string()))?;
        }
      }

      // Draw vertical major lines.
      for i in (0..=(bounds.x + bounds.width))
        .step_by(grid.major_lines_interval as usize)
        .filter(move |&x| {
          let treshhold = if bounds.x == 0 { 0 } else { bounds.x + preserved_overlap };
          x >= treshhold
        })
      {
        let x = ((i - bounds.x) as f32) * cell_size;

        // Draw the line.
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

        // Draw the line number if enabled.
        if show_grid_line_numbers {
          writer
            .create_element("text")
            .with_attributes([
              ("x", x.to_string().as_str()),
              ("y", (-cell_size).to_string().as_str()),
              ("font-size", (cell_size * 0.8).to_string().as_str()),
              ("font-weight", "bold"),
              ("text-anchor", "middle"),
              ("dominant-baseline", "hanging"),
            ])
            .write_text_content(BytesText::new(&i.to_string()))?;
        }
      }

      Ok(())
    })?;
  Ok(())
}

enum CenteringMarkPosition {
  Top,
  Bottom,
  Left,
  Right,
}

fn draw_centering_marks<W: io::Write>(
  writer: &mut Writer<W>,
  x: f32,
  y: f32,
  position: CenteringMarkPosition,
  cell_size: f32,
) -> io::Result<()> {
  let points = match position {
    CenteringMarkPosition::Top => [(0.0, 0.0), (1.0, 0.0), (0.5, 1.0)],
    CenteringMarkPosition::Bottom => [(0.0, 1.0), (0.5, 0.0), (1.0, 1.0)],
    CenteringMarkPosition::Left => [(0.0, 0.0), (1.0, 0.5), (0.0, 1.0)],
    CenteringMarkPosition::Right => [(1.0, 0.0), (1.0, 1.0), (0.0, 0.5)],
  };
  let points = points
    .iter()
    .map(|(x, y)| format!("{},{}", x * cell_size, y * cell_size,))
    .collect::<Vec<_>>()
    .join(" ");

  writer
    .create_element("g")
    .with_attribute(("transform", format!("translate({x}, {y})").as_str()))
    .write_inner_content(move |writer| {
      writer
        .create_element("polygon")
        .with_attributes([("points", points.as_str()), ("fill", "darkgrey")])
        .write_empty()?;

      Ok(())
    })?;

  Ok(())
}

fn draw_overlapping_zones<W: io::Write>(writer: &mut Writer<W>, frame: FrameContext) -> io::Result<()> {
  let FrameContext {
    bounds,
    cell_size,
    preserved_overlap,
    ..
  } = frame;

  if preserved_overlap == 0 {
    return Ok(());
  }

  writer
    .create_element("g")
    .with_attribute(("opacity", "0.5"))
    .write_inner_content(|writer| {
      // Draw vertical overlapping zone if needed.
      if bounds.x > 0 {
        writer
          .create_element("rect")
          .with_attributes([
            ("x", "0"),
            ("y", "0"),
            ("width", (preserved_overlap as f32 * cell_size).to_string().as_str()),
            ("height", (bounds.height as f32 * cell_size).to_string().as_str()),
            ("fill", "white"),
          ])
          .write_empty()?;
      }

      // Draw horizontal overlapping zone if needed.
      if bounds.y > 0 {
        writer
          .create_element("rect")
          .with_attributes([
            ("x", "0"),
            ("y", "0"),
            ("width", (bounds.width as f32 * cell_size).to_string().as_str()),
            ("height", (preserved_overlap as f32 * cell_size).to_string().as_str()),
            ("fill", "white"),
          ])
          .write_empty()?;
      }

      Ok(())
    })?;

  Ok(())
}
