use std::fs::File;
use std::io::Cursor;

use super::*;

fn load_fixture(name: &str) -> File {
  let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
    .join("testdata/pmaker/xsd")
    .join(name);
  File::open(path).unwrap()
}

#[test]
fn reads_signature() {
  assert_eq!(
    read_signature(&mut Cursor::new(vec![0x10, 0x05])).unwrap(),
    VALID_SIGNATURE
  );

  assert_ne!(
    read_signature(&mut Cursor::new(vec![0x00, 0x00])).unwrap(),
    VALID_SIGNATURE
  );
}

#[test]
fn reads_palette() {
  let loaded_palette = read_palette(&mut load_fixture("palette")).unwrap();
  let expected_palette = vec![
    PaletteItem {
      brand: String::from("DMC"),
      number: String::from("310"),
      name: String::from("Black"),
      color: String::from("2C3225"),
      blends: None,
      bead: None,
      strands: Some(Default::default()),
    },
    PaletteItem {
      brand: String::from("PNK Kirova"),
      number: String::from("9224"),
      name: String::from("ПНК Кирова"),
      color: String::from("B40032"),
      blends: None,
      bead: None,
      strands: Some(Default::default()),
    },
    PaletteItem {
      brand: String::from("Mill Hill Frosted Glass Seed Bead"),
      number: String::from("62038"),
      name: String::from("Frosted Aquamarine"),
      color: String::from("A6D3D9"),
      blends: None,
      bead: Some(Bead { length: 2.5, diameter: 1.5 }),
      strands: Some(Default::default()),
    },
    PaletteItem {
      brand: String::from("Blend"),
      number: String::from("11"),
      name: String::from(""),
      color: String::from("93D0D3"),
      blends: Some(vec![
        Blend {
          brand: String::from("DMC"),
          number: String::from("964"),
          strands: 1,
        },
        Blend {
          brand: String::from("DMC"),
          number: String::from("3766"),
          strands: 1,
        },
      ]),
      bead: None,
      strands: Some(StitchStrands {
        full: Some(2),
        petite: Some(2),
        half: Some(2),
        quarter: Some(2),
        back: Some(2),
        straight: Some(2),
        french_knot: Some(2),
        special: Some(2),
      }),
    },
  ];
  for (loaded, expected) in loaded_palette.iter().zip(expected_palette.iter()) {
    assert_eq!(loaded, expected);
  }
}

#[test]
fn reads_formats() {
  let loaded_formats = read_formats(&mut load_fixture("formats"), 2).unwrap();
  let expected_formats = vec![
    Formats {
      symbol: SymbolFormat {
        use_alt_bg_color: false,
        bg_color: String::from("FFFFFF"),
        fg_color: String::from("000000"),
      },
      back_stitch: LineStitchFormat {
        use_alt_color: false,
        color: String::from("000000"),
        style: 5,
        thickness: 1.0,
      },
      straight_stitch: LineStitchFormat {
        use_alt_color: false,
        color: String::from("000000"),
        style: 5,
        thickness: 1.0,
      },
      french_knot: NodeStitchFormat {
        use_dot_style: true,
        use_alt_color: false,
        color: String::from("000000"),
        thickness: 4.0,
      },
      bead: NodeStitchFormat {
        use_dot_style: true,
        use_alt_color: false,
        color: String::from("000000"),
        thickness: 4.0,
      },
      special_stitch: LineStitchFormat {
        use_alt_color: false,
        color: String::from("000000"),
        style: 5,
        thickness: 1.0,
      },
      font: FontFormat {
        font_name: Some(String::from("CrossStitch3")),
        bold: false,
        italic: false,
        stitch_size: 100,
        small_stitch_size: 60,
      },
    },
    Formats {
      symbol: SymbolFormat {
        use_alt_bg_color: false,
        bg_color: String::from("FFFFFF"),
        fg_color: String::from("000000"),
      },
      back_stitch: LineStitchFormat {
        use_alt_color: false,
        color: String::from("FFFFFF"),
        style: 8,
        thickness: 1.5,
      },
      straight_stitch: LineStitchFormat {
        use_alt_color: false,
        color: String::from("FFFFFF"),
        style: 6,
        thickness: 0.8,
      },
      french_knot: NodeStitchFormat {
        use_dot_style: false,
        use_alt_color: false,
        color: String::from("FFFFFF"),
        thickness: 4.0,
      },
      bead: NodeStitchFormat {
        use_dot_style: false,
        use_alt_color: false,
        color: String::from("FFFFFF"),
        thickness: 4.0,
      },
      special_stitch: LineStitchFormat {
        use_alt_color: false,
        color: String::from("FFFFFF"),
        style: 5,
        thickness: 1.5,
      },
      font: FontFormat {
        font_name: Some(String::from("CrossStitch3")),
        bold: false,
        italic: false,
        stitch_size: 80,
        small_stitch_size: 50,
      },
    },
  ];
  for (loaded, expected) in loaded_formats.iter().zip(expected_formats.iter()) {
    assert_eq!(loaded, expected);
  }
}

#[test]
fn reads_symbols() {
  let loaded_symbols = read_symbols(&mut load_fixture("symbols"), 2).unwrap();
  let expected_symbols = [
    Symbols {
      full: Some(33),
      petite: Some(34),
      half: Some(35),
      quarter: Some(36),
      french_knot: Some(37),
      bead: Some(38),
    },
    Symbols {
      full: Some(164),
      petite: None,
      half: None,
      quarter: None,
      french_knot: None,
      bead: None,
    },
  ];
  for (loaded, expected) in loaded_symbols.iter().zip(expected_symbols.iter()) {
    assert_eq!(loaded, expected);
  }
}

#[test]
fn reads_pattern_settings() {
  let (pattern_settings, print_settings) =
    read_pattern_and_print_settings(&mut load_fixture("pattern_settings")).unwrap();

  assert_eq!(
    pattern_settings,
    PatternSettings {
      default_stitch_font: String::from("CrossStitch3"),
      view: 2,
      zoom: 0,
      show_grid: true,
      show_rulers: true,
      show_centering_marks: false,
      show_fabric_colors_with_symbols: false,
      gaps_between_stitches: false,
    },
  );

  assert_eq!(
    print_settings,
    PrintSettings {
      font: Font {
        name: String::from("Courier New"),
        size: 10,
        weight: 400,
        italic: false,
      },
      header: String::from("&l&t &r&n"),
      footer: String::from(""),
      margins: PageMargins {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5,
        header: 0.5,
        footer: 0.5,
      },
      show_page_numbers: true,
      show_adjacent_page_numbers: true,
      center_chart_on_pages: false,
    },
  );
}

#[test]
fn reads_grid_settings() {
  assert_eq!(
    read_grid(&mut load_fixture("grid_settings")).unwrap(),
    Grid {
      major_lines_interval: 10,
      minor_screen_lines: GridLineStyle {
        color: String::from("C8C8C8"),
        thickness: 0.072,
      },
      major_screen_lines: GridLineStyle {
        color: String::from("646464"),
        thickness: 0.072,
      },
      minor_printer_lines: GridLineStyle {
        color: String::from("000000"),
        thickness: 0.144,
      },
      major_printer_lines: GridLineStyle {
        color: String::from("000000"),
        thickness: 0.504,
      },
    }
  );
}

#[test]
fn reads_pattern_info() {
  assert_eq!(
    read_pattern_info(&mut load_fixture("pattern_info")).unwrap(),
    PatternInfo {
      title: String::from("Embroidery Studio Demo"),
      author: String::from("Nazar Antoniuk"),
      company: String::from("Embroidery Studio"),
      copyright: String::from("Embroidery Studio"),
      description: String::from("Shows different stitch types"),
    }
  );
}

#[test]
fn reads_stitch_settings() {
  assert_eq!(
    read_stitch_settings(&mut load_fixture("stitch_settings")).unwrap(),
    StitchSettings {
      default_strands: StitchStrands {
        full: 2,
        petite: 2,
        half: 2,
        quarter: 2,
        back: 1,
        straight: 1,
        french_knot: 2,
        special: 2,
      },
      display_thickness: [1.0, 1.5, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 4.0,],
      outlined_stitches: true,
      stitch_outline: StitchOutline {
        color: None,
        color_percentage: 80,
        thickness: 0.2,
      }
    }
  );
}

#[test]
fn reads_symbol_settings() {
  assert_eq!(
    read_symbol_settings(&mut load_fixture("symbol_settings")).unwrap(),
    SymbolSettings {
      screen_spacing: (1, 1),
      printer_spacing: (1, 1),
      scale_using_maximum_font_width: true,
      scale_using_font_height: true,
      stitch_size: 100,
      small_stitch_size: 60,
      draw_symbols_over_backstitches: false,
      show_stitch_color: false,
      use_large_half_stitch_symbol: false,
      use_triangles_behind_quarter_stitches: false,
    }
  );
}

#[test]
fn reproduces_decoding_values() {
  let xsd_random_numbers = [498347506, 626547637, 1679951037, 2146703145];
  let (decoding_key, decoding_values) = reproduce_decoding_values(&xsd_random_numbers).unwrap();
  assert_eq!(decoding_key, -228908503);
  assert_eq!(
    decoding_values,
    [18, 25, 28, 30, 21, 26, 13, 22, 29, 30, 15, 23, 9, 20, 10, 5]
  );
}

#[test]
fn reads_stitches() {
  let (loaded_fullstitches, loaded_partstitches) =
    read_stitches(&mut load_fixture("stitches"), 10, 10 * 10, 8).unwrap();
  let expected_fullstitches = [
    FullStitch {
      x: 0.0,
      y: 0.0,
      palindex: 1,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: 9.0,
      y: 0.0,
      palindex: 2,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: 1.0,
      y: 1.0,
      palindex: 3,
      kind: FullStitchKind::Petite,
    },
    FullStitch {
      x: 2.5,
      y: 1.0,
      palindex: 3,
      kind: FullStitchKind::Petite,
    },
    FullStitch {
      x: 1.0,
      y: 2.5,
      palindex: 3,
      kind: FullStitchKind::Petite,
    },
    FullStitch {
      x: 2.5,
      y: 2.5,
      palindex: 3,
      kind: FullStitchKind::Petite,
    },
    FullStitch {
      x: 0.0,
      y: 9.0,
      palindex: 6,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: 9.0,
      y: 9.0,
      palindex: 0,
      kind: FullStitchKind::Full,
    },
  ];
  for (loaded, expected) in loaded_fullstitches.iter().zip(expected_fullstitches.iter()) {
    assert_eq!(loaded, expected);
  }

  let expected_partstitches = [
    PartStitch {
      x: 1.5,
      y: 1.5,
      palindex: 4,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: 2.0,
      y: 1.5,
      palindex: 4,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: 1.5,
      y: 2.0,
      palindex: 4,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: 2.0,
      y: 2.0,
      palindex: 4,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: 3.0,
      y: 3.0,
      palindex: 5,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: 4.0,
      y: 3.0,
      palindex: 5,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: 3.0,
      y: 4.0,
      palindex: 5,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: 4.0,
      y: 4.0,
      palindex: 5,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
  ];
  for (loaded, expected) in loaded_partstitches.iter().zip(expected_partstitches.iter()) {
    assert_eq!(loaded, expected);
  }
}

#[test]
fn reads_special_stitch_models() {
  let loaded_special_stitch_models = read_special_stitch_models(&mut load_fixture("special_stitch_models")).unwrap();
  let expected_speciql_stitch_models = vec![
    SpecialStitchModel {
      unique_name: String::from("Lasy Daisy Over 2x1"),
      name: String::from(""),
      width: 2.0,
      height: 2.0,
      nodestitches: vec![],
      linestitches: vec![],
      curvedstitches: vec![CurvedStitch {
        points: vec![
          (1.5666666, 2.0666666),
          (0.6, 0.8333333),
          (0.6333333, 0.23333333),
          (0.79999995, 0.06666667),
          (1.1333333, 0.2),
          (1.3666667, 0.56666666),
          (1.5666666, 2.0666666),
        ],
      }],
    },
    SpecialStitchModel {
      unique_name: String::from("Rhodes Heart - over 6"),
      name: String::from("Rhodes Heart"),
      width: 3.0,
      height: 2.5,
      nodestitches: vec![],
      linestitches: vec![
        LineStitch {
          x: (1.0, 2.0),
          y: (2.0, 0.0),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (0.5, 2.5),
          y: (1.5, 0.0),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (0.0, 3.0),
          y: (1.0, 0.5),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (0.0, 3.0),
          y: (0.5, 1.0),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (0.5, 2.5),
          y: (0.0, 1.5),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (1.0, 2.0),
          y: (0.0, 2.0),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (1.5, 1.5),
          y: (0.5, 2.5),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
      ],
      curvedstitches: vec![],
    },
  ];
  for (loaded, expected) in loaded_special_stitch_models
    .iter()
    .zip(expected_speciql_stitch_models.iter())
  {
    assert_eq!(loaded, expected);
  }
}

#[test]
fn reads_joints() {
  let (loaded_linestitches, loaded_nodestitches, loaded_special_stitches, _) =
    read_joints(&mut load_fixture("joints"), 16).unwrap();

  let expected_nodestitches = [
    NodeStitch {
      x: 3.0,
      y: 3.0,
      rotated: false,
      palindex: 0,
      kind: NodeStitchKind::FrenchKnot,
    },
    NodeStitch {
      x: 3.0,
      y: 4.5,
      rotated: false,
      palindex: 2,
      kind: NodeStitchKind::Bead,
    },
    NodeStitch {
      x: 3.0,
      y: 5.5,
      rotated: true,
      palindex: 2,
      kind: NodeStitchKind::Bead,
    },
  ];
  for (loaded, expected) in loaded_nodestitches.iter().zip(expected_nodestitches.iter()) {
    assert_eq!(loaded, expected);
  }

  let expected_linestitches = [
    LineStitch {
      x: (1.0, 2.0),
      y: (1.0, 2.0),
      palindex: 1,
      kind: LineStitchKind::Back,
    },
    LineStitch {
      x: (3.0, 4.0),
      y: (2.0, 1.0),
      palindex: 1,
      kind: LineStitchKind::Back,
    },
    LineStitch {
      x: (4.0, 5.0),
      y: (1.0, 1.0),
      palindex: 1,
      kind: LineStitchKind::Back,
    },
    LineStitch {
      x: (1.0, 5.0),
      y: (2.0, 2.0),
      palindex: 1,
      kind: LineStitchKind::Straight,
    },
  ];
  for (loaded, expected) in loaded_linestitches.iter().zip(expected_linestitches.iter()) {
    assert_eq!(loaded, expected);
  }

  let expected_special_stitches = [
    SpecialStitch {
      x: 5.5,
      y: 1.0,
      rotation: 0,
      flip: (false, false),
      palindex: 0,
      modindex: 0,
    },
    SpecialStitch {
      x: 9.0,
      y: 1.0,
      rotation: 0,
      flip: (true, false),
      palindex: 0,
      modindex: 0,
    },
    SpecialStitch {
      x: 8.5,
      y: 3.0,
      rotation: 0,
      flip: (false, true),
      palindex: 0,
      modindex: 0,
    },
    SpecialStitch {
      x: 12.0,
      y: 3.0,
      rotation: 0,
      flip: (true, true),
      palindex: 0,
      modindex: 0,
    },
    SpecialStitch {
      x: 9.0,
      y: 4.5,
      rotation: 90,
      flip: (false, false),
      palindex: 0,
      modindex: 0,
    },
    SpecialStitch {
      x: 9.0,
      y: 5.5,
      rotation: 270,
      flip: (false, false),
      palindex: 0,
      modindex: 0,
    },
    SpecialStitch {
      x: 9.0,
      y: 6.5,
      rotation: 90,
      flip: (false, true),
      palindex: 0,
      modindex: 0,
    },
    SpecialStitch {
      x: 9.0,
      y: 8.0,
      rotation: 90,
      flip: (true, false),
      palindex: 0,
      modindex: 0,
    },
    SpecialStitch {
      x: 11.0,
      y: 5.0,
      rotation: 0,
      flip: (false, false),
      palindex: 1,
      modindex: 1,
    },
  ];
  for (loaded, expected) in loaded_special_stitches.iter().zip(expected_special_stitches.iter()) {
    assert_eq!(loaded, expected);
  }
}
