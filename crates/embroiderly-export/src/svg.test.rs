use super::*;

static SYMBOL_FONT: &str = "CrossStitch3";

const CELL_SIZE: f32 = 14.0;

fn create_writer() -> Writer<std::io::Cursor<Vec<u8>>> {
  Writer::new_with_indent(std::io::Cursor::new(Vec::new()), b' ', 2)
}

fn create_palette() -> Vec<PaletteItem> {
  vec![
    PaletteItem {
      brand: String::from("DMC"),
      number: String::from("310"),
      name: String::from("Black"),
      color: String::from("2C3225"),
      blends: None,
      symbol_font: None,
      symbol: None,
    },
    PaletteItem {
      brand: String::from("DMC"),
      number: String::from("3713"),
      name: String::from("Salmon-VY LT"),
      color: String::from("F0D1CB"),
      blends: None,
      symbol_font: None,
      symbol: Some(Symbol::Char("A".to_string())),
    },
    PaletteItem {
      brand: String::from("DMC"),
      number: String::from("927"),
      name: String::from("Gray Green-LT"),
      color: String::from("A6BDB4"),
      blends: None,
      symbol_font: Some(String::from("Ursasoftware")),
      symbol: Some(Symbol::Code(63)),
    },
  ]
}

#[test]
fn writes_full_stitches() {
  let xml = r##"<g id="fullstitches">
  <g transform="translate(0, 0)">
    <rect x="0" y="0" width="14" height="14" fill="#2C3225" stroke="#000000"/>
  </g>
  <g transform="translate(14, 0)">
    <rect x="0" y="0" width="14" height="14" fill="#F0D1CB" stroke="#000000"/>
    <text x="7" y="7" font-size="11.2" font-family="CrossStitch3" text-anchor="middle" dominant-baseline="middle">A</text>
  </g>
  <g transform="translate(0, 14)">
    <rect x="0" y="0" width="14" height="14" fill="#A6BDB4" stroke="#000000"/>
    <text x="7" y="7" font-size="11.2" font-family="Ursasoftware" text-anchor="middle" dominant-baseline="middle">?</text>
  </g>
  <g transform="translate(14, 14)">
    <rect x="0" y="0" width="7" height="7" fill="#F0D1CB" stroke="#000000"/>
    <text x="3.5" y="3.5" font-size="5.6" font-family="CrossStitch3" text-anchor="middle" dominant-baseline="middle">A</text>
  </g>
</g>"##;

  let mut writer = create_writer();
  let palette = create_palette();
  let fullstitches = [
    FullStitch {
      x: Coord::new(0.0).unwrap(),
      y: Coord::new(0.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: Coord::new(1.0).unwrap(),
      y: Coord::new(0.0).unwrap(),
      palindex: 1,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: Coord::new(0.0).unwrap(),
      y: Coord::new(1.0).unwrap(),
      palindex: 2,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: Coord::new(1.0).unwrap(),
      y: Coord::new(1.0).unwrap(),
      palindex: 1,
      kind: FullStitchKind::Petite,
    },
  ];

  write_full_stitches(&mut writer, &palette, &fullstitches, SYMBOL_FONT, CELL_SIZE).unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();

  assert_eq!(result, xml);
}

#[test]
fn writes_part_stitches() {
  let xml = r##"<g id="partstitches">
  <g transform="translate(0, 0)">
    <polygon points="14,0 14,4.9 4.9,14 0,14 0,9.099999 9.099999,0" fill="#F0D1CB" stroke="#000000"/>
    <text x="10.5" y="3.5" font-size="5.6" font-family="CrossStitch3" text-anchor="middle" dominant-baseline="middle">A</text>
    <text x="3.5" y="10.5" font-size="5.6" font-family="CrossStitch3" text-anchor="middle" dominant-baseline="middle">A</text>
  </g>
  <g transform="translate(14, 0)">
    <polygon points="0,0 4.9,0 14,9.099999 14,14 9.099999,14 0,4.9" fill="#A6BDB4" stroke="#000000"/>
    <text x="3.5" y="3.5" font-size="5.6" font-family="Ursasoftware" text-anchor="middle" dominant-baseline="middle">?</text>
    <text x="10.5" y="10.5" font-size="5.6" font-family="Ursasoftware" text-anchor="middle" dominant-baseline="middle">?</text>
  </g>
  <g transform="translate(7, 14)">
    <polygon points="7,0 7,3.5 3.5,7 0,7 0,3.5 3.5,0" fill="#A6BDB4" stroke="#000000"/>
    <text x="3.5" y="3.5" font-size="5.6" font-family="Ursasoftware" text-anchor="middle" dominant-baseline="middle">?</text>
  </g>
  <g transform="translate(14, 14)">
    <polygon points="0,0 0,3.5 3.5,7 7,7 7,3.5 3.5,0" fill="#F0D1CB" stroke="#000000"/>
    <text x="3.5" y="3.5" font-size="5.6" font-family="CrossStitch3" text-anchor="middle" dominant-baseline="middle">A</text>
  </g>
</g>"##;

  let mut writer = create_writer();
  let palette = create_palette();
  let partstitches = [
    PartStitch {
      x: Coord::new(0.0).unwrap(),
      y: Coord::new(0.0).unwrap(),
      palindex: 1,
      kind: PartStitchKind::Half,
      direction: PartStitchDirection::Forward,
    },
    PartStitch {
      x: Coord::new(1.0).unwrap(),
      y: Coord::new(0.0).unwrap(),
      palindex: 2,
      kind: PartStitchKind::Half,
      direction: PartStitchDirection::Backward,
    },
    PartStitch {
      x: Coord::new(0.5).unwrap(),
      y: Coord::new(1.0).unwrap(),
      palindex: 2,
      kind: PartStitchKind::Quarter,
      direction: PartStitchDirection::Forward,
    },
    PartStitch {
      x: Coord::new(1.0).unwrap(),
      y: Coord::new(1.0).unwrap(),
      palindex: 1,
      kind: PartStitchKind::Quarter,
      direction: PartStitchDirection::Backward,
    },
  ];

  write_part_stitches(&mut writer, &palette, &partstitches, SYMBOL_FONT, CELL_SIZE).unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();

  assert_eq!(result, xml);
}

#[test]
fn writes_line_stitches() {
  let xml = r##"<g id="linestitches">
  <line x1="0" y1="0" x2="56" y2="14" stroke="#2C3225" stroke-width="2.8" stroke-linecap="round"/>
  <line x1="0" y1="14" x2="56" y2="0" stroke="#F0D1CB" stroke-width="2.8" stroke-linecap="round"/>
</g>"##;

  let mut writer = create_writer();
  let palette = create_palette();
  let linestitches = [
    LineStitch {
      x: (Coord::new(0.0).unwrap(), Coord::new(4.0).unwrap()),
      y: (Coord::new(0.0).unwrap(), Coord::new(1.0).unwrap()),
      palindex: 0,
      kind: LineStitchKind::Straight,
    },
    LineStitch {
      x: (Coord::new(0.0).unwrap(), Coord::new(4.0).unwrap()),
      y: (Coord::new(1.0).unwrap(), Coord::new(0.0).unwrap()),
      palindex: 1,
      kind: LineStitchKind::Back,
    },
  ];

  write_line_stitches(&mut writer, &palette, &linestitches, CELL_SIZE).unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();

  assert_eq!(result, xml);
}

#[test]
fn writes_node_stitches() {
  let xml = r##"<g id="nodestitches">
  <circle cx="0" cy="0" r="3.5" fill="#2C3225" stroke="#000000"/>
  <circle cx="14" cy="0" r="3.5" fill="#F0D1CB" stroke="#000000"/>
</g>"##;

  let mut writer = create_writer();
  let palette = create_palette();
  let nodestitches = [
    NodeStitch {
      x: Coord::new(0.0).unwrap(),
      y: Coord::new(0.0).unwrap(),
      palindex: 0,
      kind: NodeStitchKind::Bead,
      rotated: false,
    },
    NodeStitch {
      x: Coord::new(1.0).unwrap(),
      y: Coord::new(0.0).unwrap(),
      palindex: 1,
      kind: NodeStitchKind::FrenchKnot,
      rotated: false,
    },
  ];

  write_node_stitches(&mut writer, &palette, &nodestitches, CELL_SIZE).unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();

  assert_eq!(result, xml);
}

#[test]
fn writes_grid() {
  let xml = r##"<g id="grid">
  <line x1="0" y1="0" x2="28" y2="0" stroke="#C8C8C8" stroke-width="0.1008"/>
  <line x1="0" y1="14" x2="28" y2="14" stroke="#C8C8C8" stroke-width="0.1008"/>
  <line x1="0" y1="28" x2="28" y2="28" stroke="#C8C8C8" stroke-width="0.1008"/>
  <line x1="0" y1="0" x2="0" y2="28" stroke="#C8C8C8" stroke-width="0.1008"/>
  <line x1="14" y1="0" x2="14" y2="28" stroke="#C8C8C8" stroke-width="0.1008"/>
  <line x1="28" y1="0" x2="28" y2="28" stroke="#C8C8C8" stroke-width="0.1008"/>
  <line x1="0" y1="0" x2="28" y2="0" stroke="#000000" stroke-width="0.2016"/>
  <line x1="0" y1="0" x2="0" y2="28" stroke="#000000" stroke-width="0.2016"/>
</g>"##;

  let mut writer = create_writer();
  let grid = Grid {
    major_lines_interval: 10,
    minor_lines: GridLine {
      color: String::from("C8C8C8"),
      thickness: 0.0072,
    },
    major_lines: GridLine {
      color: String::from("000000"),
      thickness: 0.0144,
    },
  };

  write_grid(
    &mut writer,
    &grid,
    Bounds { x: 0, y: 0, width: 2, height: 2 },
    CELL_SIZE,
    0,
  )
  .unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();

  assert_eq!(result, xml);
}
