use super::*;

fn create_reader(xml: &str) -> Reader<&[u8]> {
  let mut reader = Reader::from_str(xml);

  let reader_config = reader.config_mut();
  reader_config.expand_empty_elements = true;
  reader_config.check_end_names = true;
  reader_config.trim_text(true);

  reader
}

fn create_writer() -> Writer<std::io::Cursor<Vec<u8>>> {
  Writer::new_with_indent(std::io::Cursor::new(Vec::new()), b' ', 2)
}

#[test]
fn reads_and_writes_pattern_properties() {
  let xml = r#"<properties oxsversion="1.0" software="MySoftware" software_version="0.0.0" chartwidth="20" chartheight="10" charttitle="My Pattern" author="Me" copyright="" instructions="Enjoy the embroidery process!" stitchesperinch="14" stitchesperinch_y="14" palettecount="5"/>"#;

  let mut reader = create_reader(xml);
  let attributes = if let Event::Start(e) = reader.read_event().unwrap() {
    AttributesMap::try_from(e.attributes()).unwrap()
  } else {
    unreachable!()
  };

  let (pattern_width, pattern_height, pattern_info, spi, palette_size) = read_pattern_properties(attributes).unwrap();

  assert_eq!(pattern_width, 20);
  assert_eq!(pattern_height, 10);
  assert_eq!(
    pattern_info,
    PatternInfo {
      title: String::from("My Pattern"),
      author: String::from("Me"),
      copyright: String::from(""),
      description: String::from("Enjoy the embroidery process!"),
    }
  );
  assert_eq!(spi, (14, 14));
  assert_eq!(palette_size, Some(5));

  let mut writer = create_writer();
  write_pattern_properties(
    &mut writer,
    pattern_width,
    pattern_height,
    &pattern_info,
    spi,
    palette_size.unwrap(),
    &PackageInfo {
      name: String::from("MySoftware"),
      version: String::from("0.0.0"),
    },
  )
  .unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn reads_and_writes_default_pattern_properties() {
  let mut reader = create_reader("<properties />");
  let attributes = if let Event::Start(e) = reader.read_event().unwrap() {
    AttributesMap::try_from(e.attributes()).unwrap()
  } else {
    unreachable!()
  };

  let (pattern_width, pattern_height, pattern_info, spi, palette_size) = read_pattern_properties(attributes).unwrap();

  assert_eq!(pattern_width, Fabric::DEFAULT_WIDTH);
  assert_eq!(pattern_height, Fabric::DEFAULT_HEIGHT);
  assert_eq!(
    pattern_info,
    PatternInfo {
      title: String::from(""),
      author: String::from(""),
      copyright: String::from(""),
      description: String::from(""),
    }
  );
  assert_eq!(spi, (Fabric::DEFAULT_SPI, Fabric::DEFAULT_SPI));
  assert_eq!(palette_size, None);

  let mut writer = create_writer();
  write_pattern_properties(
    &mut writer,
    pattern_width,
    pattern_height,
    &pattern_info,
    spi,
    0,
    &PackageInfo {
      name: String::from("MySoftware"),
      version: String::from("0.0.0"),
    },
  )
  .unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let expected = r#"<properties oxsversion="1.0" software="MySoftware" software_version="0.0.0" chartwidth="100" chartheight="100" charttitle="" author="" copyright="" instructions="" stitchesperinch="14" stitchesperinch_y="14" palettecount="0"/>"#;
  let diff = prettydiff::diff_lines(&result, expected);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn reads_and_writes_palette() {
  let xml = r#"<palette>
  <palette_item index="0" name="cloth" color="FFFFFF" kind="Aida"/>
  <palette_item index="1" number="DMC 310" name="Black" color="2C3225" fontname="Ursasoftware"/>
  <palette_item index="2" number="Anchor Marlitt 815" name="Fuschia" color="9B2759" fontname="CrossStitch3" symbol="131"/>
  <palette_item index="3" number="Madeira1206" name="Jade-MD" color="007F49" fontname="Ursasoftware" symbol="k"/>
</palette>"#;

  let expected_fabric = Fabric {
    name: String::from("cloth"),
    color: String::from("FFFFFF"),
    ..Default::default()
  };
  let expected_palette = vec![
    PaletteItem {
      brand: String::from("DMC"),
      number: String::from("310"),
      name: String::from("Black"),
      color: String::from("2C3225"),
      blends: None,
      symbol: None,
      symbol_font: Some(String::from("Ursasoftware")),
    },
    PaletteItem {
      brand: String::from("Anchor Marlitt"),
      number: String::from("815"),
      name: String::from("Fuschia"),
      color: String::from("9B2759"),
      blends: None,
      symbol: Some(Symbol::Code(131)),
      symbol_font: Some(String::from("CrossStitch3")),
    },
    PaletteItem {
      brand: String::from(""),
      number: String::from("Madeira1206"),
      name: String::from("Jade-MD"),
      color: String::from("007F49"),
      blends: None,
      symbol: Some(Symbol::Char("k".to_string())),
      symbol_font: Some(String::from("Ursasoftware")),
    },
  ];

  let mut reader = create_reader(xml);
  reader.read_event().unwrap(); // Consume the start `palette` tag.
  let (fabric, palette) = read_palette(&mut reader, Some(3)).unwrap();
  assert_eq!(fabric, expected_fabric);
  assert_eq!(palette, expected_palette);

  let mut writer = create_writer();
  write_palette(&mut writer, &fabric, &palette, "Ursasoftware").unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn reads_and_writes_blends() {
  let xml = r#"<palette>
  <palette_item index="0" name="cloth" color="FFFFFF" kind="Aida"/>
  <palette_item index="1" number="Blend 1" name="Crimson Red" color="CB3B41" fontname="Ursasoftware">
    <blend number="DMC 326"/>
    <blend number="DMC 309"/>
    <blend number="DMC 606"/>
    <blend number="DMC 3801"/>
  </palette_item>
</palette>"#;

  let expected_palette = vec![PaletteItem {
    brand: String::from("Blend"),
    number: String::from("1"),
    name: String::from("Crimson Red"),
    color: String::from("CB3B41"),
    blends: Some(vec![
      Blend {
        brand: String::from("DMC"),
        number: String::from("326"),
      },
      Blend {
        brand: String::from("DMC"),
        number: String::from("309"),
      },
      Blend {
        brand: String::from("DMC"),
        number: String::from("606"),
      },
      Blend {
        brand: String::from("DMC"),
        number: String::from("3801"),
      },
    ]),
    symbol: None,
    symbol_font: Some(String::from("Ursasoftware")),
  }];

  let mut reader = create_reader(xml);
  reader.read_event().unwrap(); // Consume the start `palette` tag.
  let (fabric, palette) = read_palette(&mut reader, Some(1)).unwrap();
  assert_eq!(palette, expected_palette);

  let mut writer = create_writer();
  write_palette(&mut writer, &fabric, &palette, "Ursasoftware").unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn reads_ursa_blends() {
  let xml = r#"<palette>
  <palette_item index="0" name="cloth" color="FFFFFF" kind="Aida"/>
  <palette_item index="1" number="DMC 158 [+]" name="DMC 158 [+] DMC 208" color="303065" blendcolor="824596"/>
</palette>"#;

  let expected_palette = vec![PaletteItem {
    brand: String::from("DMC"),
    number: String::from("158"),
    name: String::from("DMC 158 [+] DMC 208"),
    color: String::from("303065"),
    blends: Some(vec![
      Blend {
        brand: String::from("DMC"),
        number: String::from("158"),
      },
      Blend {
        brand: String::from("DMC"),
        number: String::from("208"),
      },
    ]),
    symbol: None,
    symbol_font: None,
  }];

  let mut reader = create_reader(xml);
  reader.read_event().unwrap(); // Consume the start `palette` tag.
  let (_fabric, palette) = read_palette(&mut reader, Some(1)).unwrap();
  assert_eq!(palette, expected_palette);
}

#[test]
fn reads_and_writes_full_stitches() {
  let xml = r#"<fullstitches>
  <stitch x="19" y="8" palindex="2"/>
  <stitch x="6" y="18" palindex="7"/>
  <stitch x="30" y="46" palindex="4"/>
  <stitch x="7" y="48" palindex="5"/>
</fullstitches>"#;

  let expected_stitches = vec![
    FullStitch {
      x: Coord::new(19.0).unwrap(),
      y: Coord::new(8.0).unwrap(),
      palindex: 1,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: Coord::new(6.0).unwrap(),
      y: Coord::new(18.0).unwrap(),
      palindex: 6,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: Coord::new(30.0).unwrap(),
      y: Coord::new(46.0).unwrap(),
      palindex: 3,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: Coord::new(7.0).unwrap(),
      y: Coord::new(48.0).unwrap(),
      palindex: 4,
      kind: FullStitchKind::Full,
    },
  ];

  let mut reader = create_reader(xml);
  reader.read_event().unwrap(); // Consume the start `fullstitches` tag.
  let stitches = read_full_stitches(&mut reader).unwrap();
  assert_eq!(stitches, expected_stitches);

  let mut writer = create_writer();
  write_full_stitches(&mut writer, &Stitches::from_iter(stitches)).unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn reads_and_writes_part_stitches() {
  let xml = r#"<partstitches>
  <partstitch x="1" y="1" palindex1="1" palindex2="0" direction="3"/>
  <partstitch x="1" y="3" palindex1="1" palindex2="0" direction="4"/>
  <partstitch x="3" y="1" palindex1="2" palindex2="0" direction="2"/>
  <partstitch x="5" y="1" palindex1="0" palindex2="2" direction="1"/>
  <partstitch x="5" y="3" palindex1="0" palindex2="2" direction="2"/>
  <partstitch x="3" y="3" palindex1="2" palindex2="0" direction="1"/>
  <partstitch x="7" y="1" palindex1="1" palindex2="2" direction="1"/>
  <partstitch x="7" y="3" palindex1="2" palindex2="1" direction="2"/>
</partstitches>"#;

  let expected_stitches = vec![
    // Hals stitches.
    PartStitch {
      x: Coord::new(1.0).unwrap(),
      y: Coord::new(1.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: Coord::new(1.0).unwrap(),
      y: Coord::new(3.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
    // Top-left tree-quarter stitch.
    PartStitch {
      x: Coord::new(3.0).unwrap(),
      y: Coord::new(1.0).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: Coord::new(3.0).unwrap(),
      y: Coord::new(1.0).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
    // Top-right tree-quarter stitch.
    PartStitch {
      x: Coord::new(5.0).unwrap(),
      y: Coord::new(1.0).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: Coord::new(5.5).unwrap(),
      y: Coord::new(1.0).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    // Bottom-right tree-quarter stitch.
    PartStitch {
      x: Coord::new(5.0).unwrap(),
      y: Coord::new(3.0).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: Coord::new(5.5).unwrap(),
      y: Coord::new(3.5).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
    // Bottom-left tree-quarter stitch.
    PartStitch {
      x: Coord::new(3.0).unwrap(),
      y: Coord::new(3.0).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: Coord::new(3.0).unwrap(),
      y: Coord::new(3.5).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    // Two tree-quarter stitches in a single cell.
    PartStitch {
      x: Coord::new(7.0).unwrap(),
      y: Coord::new(1.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: Coord::new(7.0).unwrap(),
      y: Coord::new(1.5).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: Coord::new(7.5).unwrap(),
      y: Coord::new(1.0).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    // Two tree-quarter stitches in a single cell.
    PartStitch {
      x: Coord::new(7.0).unwrap(),
      y: Coord::new(3.0).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: Coord::new(7.0).unwrap(),
      y: Coord::new(3.0).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: Coord::new(7.5).unwrap(),
      y: Coord::new(3.5).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
  ];

  let mut reader = create_reader(xml);
  reader.read_event().unwrap(); // Consume the start `partstitches` tag.
  let stitches = read_part_stitches(&mut reader).unwrap();
  assert_eq!(stitches, expected_stitches);

  // We do not support writing part stitches in the way the Ursa does it.
  // Instead, we write them as `object`s with the `quarter` or `tent` object type.
}

#[test]
fn reads_and_writes_line_stitches() {
  let xml = r#"<backstitches>
  <backstitch x1="7" x2="8" y1="15" y2="14" palindex="3" objecttype="straightstitch"/>
  <backstitch x1="6" x2="7" y1="18" y2="18" palindex="2" objecttype="backstitch"/>
  <backstitch x1="3" x2="3" y1="39" y2="40" palindex="1" objecttype="straightstitch"/>
  <backstitch x1="7" x2="8" y1="54" y2="54" palindex="4" objecttype="backstitch"/>
</backstitches>"#;

  let expected_stitches = vec![
    LineStitch {
      x: (Coord::new(7.0).unwrap(), Coord::new(8.0).unwrap()),
      y: (Coord::new(15.0).unwrap(), Coord::new(14.0).unwrap()),
      palindex: 2,
      kind: LineStitchKind::Straight,
    },
    LineStitch {
      x: (Coord::new(6.0).unwrap(), Coord::new(7.0).unwrap()),
      y: (Coord::new(18.0).unwrap(), Coord::new(18.0).unwrap()),
      palindex: 1,
      kind: LineStitchKind::Back,
    },
    LineStitch {
      x: (Coord::new(3.0).unwrap(), Coord::new(3.0).unwrap()),
      y: (Coord::new(39.0).unwrap(), Coord::new(40.0).unwrap()),
      palindex: 0,
      kind: LineStitchKind::Straight,
    },
    LineStitch {
      x: (Coord::new(7.0).unwrap(), Coord::new(8.0).unwrap()),
      y: (Coord::new(54.0).unwrap(), Coord::new(54.0).unwrap()),
      palindex: 3,
      kind: LineStitchKind::Back,
    },
  ];

  let mut reader = create_reader(xml);
  reader.read_event().unwrap(); // Consume the start `linestitches` tag.
  let stitches = read_line_stitches(&mut reader).unwrap();
  assert_eq!(stitches, expected_stitches);

  let mut writer = create_writer();
  write_line_stitches(&mut writer, &Stitches::from_iter(stitches)).unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn reads_and_writes_ornaments() {
  let xml = r#"<ornaments_inc_knots_and_beads>
  <object x1="2" y1="4" palindex="1" objecttype="quarter" petit="true"/>
  <object x1="4" y1="4" palindex="1" objecttype="quarter" petit="false"/>
  <object x1="5" y1="5" palindex="2" objecttype="tent" direction="2"/>
  <object x1="5" y1="5" palindex="2" objecttype="tent" direction="1"/>
  <object x1="1" y1="1" palindex="2" objecttype="knot" rotated="false"/>
  <object x1="3.5" y1="1.5" palindex="1" objecttype="bead" rotated="false"/>
  <object x1="10" y1="5.5" width="2" height="2" palindex="1" objecttype="specialstitch" modindex="0" rotation="90" flip_x="true" flip_y="false"/>
</ornaments_inc_knots_and_beads>"#;

  let expected_fullstitches = vec![FullStitch {
    x: Coord::new(2.0).unwrap(),
    y: Coord::new(4.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Petite,
  }];
  let expected_partstitches = vec![
    PartStitch {
      x: Coord::new(4.0).unwrap(),
      y: Coord::new(4.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: Coord::new(5.0).unwrap(),
      y: Coord::new(5.0).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: Coord::new(5.0).unwrap(),
      y: Coord::new(5.0).unwrap(),
      palindex: 1,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
  ];
  let expected_nodestitches = vec![
    NodeStitch {
      x: Coord::new(1.0).unwrap(),
      y: Coord::new(1.0).unwrap(),
      rotated: false,
      palindex: 1,
      kind: NodeStitchKind::FrenchKnot,
    },
    NodeStitch {
      x: Coord::new(3.5).unwrap(),
      y: Coord::new(1.5).unwrap(),
      rotated: false,
      palindex: 0,
      kind: NodeStitchKind::Bead,
    },
  ];
  let expected_specialstitches = vec![SpecialStitch {
    x: Coord::new(10.0).unwrap(),
    y: Coord::new(5.5).unwrap(),
    width: Coord::new(2.0).unwrap(),
    height: Coord::new(2.0).unwrap(),
    palindex: 0,
    modindex: 0,
    rotation: 90,
    flip: (true, false),
  }];

  let mut reader = create_reader(xml);
  reader.read_event().unwrap(); // Consume the start `ornaments` tag.
  let (fullstitches, partstitches, nodestitches, specialstitches) = read_ornaments(&mut reader).unwrap();
  assert_eq!(fullstitches, expected_fullstitches);
  assert_eq!(partstitches, expected_partstitches);
  assert_eq!(nodestitches, expected_nodestitches);
  assert_eq!(specialstitches, expected_specialstitches);

  let mut writer = create_writer();
  write_ornaments(
    &mut writer,
    &Stitches::from_iter(fullstitches),
    &Stitches::from_iter(partstitches),
    &Stitches::from_iter(nodestitches),
    &Stitches::from_iter(specialstitches),
  )
  .unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn reads_and_writes_special_stitch_models() {
  let xml = r#"<special_stitch_models>
  <model index="0" unique_name="Rhodes Heart - over 6" name="Rhodes Heart" width="3" height="2.5">
    <backstitch x1="1" x2="2" y1="2" y2="0" palindex="1" objecttype="straightstitch"/>
    <backstitch x1="0.5" x2="2.5" y1="1.5" y2="0" palindex="1" objecttype="straightstitch"/>
    <backstitch x1="0" x2="3" y1="1" y2="0.5" palindex="1" objecttype="straightstitch"/>
    <backstitch x1="0" x2="3" y1="0.5" y2="1" palindex="1" objecttype="straightstitch"/>
    <backstitch x1="0.5" x2="2.5" y1="0" y2="1.5" palindex="1" objecttype="straightstitch"/>
    <backstitch x1="1" x2="2" y1="0" y2="2" palindex="1" objecttype="straightstitch"/>
    <backstitch x1="1.5" x2="1.5" y1="0.5" y2="2.5" palindex="1" objecttype="straightstitch"/>
  </model>
  <model index="1" unique_name="Lazy Daisy" name="Lazy Daisy" width="1" height="1.5">
    <backstitch x1="1" y1="0" x2="0.43" y2="0.26" x3="0.06" y3="0.66" x4="0.06" y4="1.03" x5="0.5" y5="1.06" x6="0.89" y6="0.66" x7="1.1" y7="0.1" palindex="1" objecttype="curvedstitch"/>
    <backstitch x1="0.03" y1="1.13" x2="0.23" y2="0.93" palindex="1" objecttype="curvedstitch"/>
  </model>
</special_stitch_models>"#;

  let expected_models = vec![
    SpecialStitchModel {
      unique_name: String::from("Rhodes Heart - over 6"),
      name: String::from("Rhodes Heart"),
      width: 3.0,
      height: 2.5,
      linestitches: vec![
        LineStitch {
          x: (Coord::new(1.0).unwrap(), Coord::new(2.0).unwrap()),
          y: (Coord::new(2.0).unwrap(), Coord::new(0.0).unwrap()),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (Coord::new(0.5).unwrap(), Coord::new(2.5).unwrap()),
          y: (Coord::new(1.5).unwrap(), Coord::new(0.0).unwrap()),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (Coord::new(0.0).unwrap(), Coord::new(3.0).unwrap()),
          y: (Coord::new(1.0).unwrap(), Coord::new(0.5).unwrap()),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (Coord::new(0.0).unwrap(), Coord::new(3.0).unwrap()),
          y: (Coord::new(0.5).unwrap(), Coord::new(1.0).unwrap()),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (Coord::new(0.5).unwrap(), Coord::new(2.5).unwrap()),
          y: (Coord::new(0.0).unwrap(), Coord::new(1.5).unwrap()),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (Coord::new(1.0).unwrap(), Coord::new(2.0).unwrap()),
          y: (Coord::new(0.0).unwrap(), Coord::new(2.0).unwrap()),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
        LineStitch {
          x: (Coord::new(1.5).unwrap(), Coord::new(1.5).unwrap()),
          y: (Coord::new(0.5).unwrap(), Coord::new(2.5).unwrap()),
          palindex: 0,
          kind: LineStitchKind::Straight,
        },
      ],
      nodestitches: vec![],
      curvedstitches: vec![],
    },
    SpecialStitchModel {
      unique_name: String::from("Lazy Daisy"),
      name: String::from("Lazy Daisy"),
      width: 1.0,
      height: 1.5,
      linestitches: vec![],
      nodestitches: vec![],
      curvedstitches: vec![
        CurvedStitch {
          points: vec![
            (Coord::new(1.00).unwrap(), Coord::new(0.00).unwrap()),
            (Coord::new(0.43).unwrap(), Coord::new(0.26).unwrap()),
            (Coord::new(0.06).unwrap(), Coord::new(0.66).unwrap()),
            (Coord::new(0.06).unwrap(), Coord::new(1.03).unwrap()),
            (Coord::new(0.50).unwrap(), Coord::new(1.06).unwrap()),
            (Coord::new(0.89).unwrap(), Coord::new(0.66).unwrap()),
            (Coord::new(1.10).unwrap(), Coord::new(0.10).unwrap()),
          ],
        },
        CurvedStitch {
          points: vec![
            (Coord::new(0.03).unwrap(), Coord::new(1.13).unwrap()),
            (Coord::new(0.23).unwrap(), Coord::new(0.93).unwrap()),
          ],
        },
      ],
    },
  ];

  let mut reader = create_reader(xml);
  reader.read_event().unwrap(); // Consume the start `special_stitch_models` tag.
  let models = read_special_stitch_models(&mut reader).unwrap();
  assert_eq!(models, expected_models);

  let mut writer = create_writer();
  write_special_stitch_models(&mut writer, &models).unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn fails_when_chart_tag_is_not_found() {
  let xml = "<not_a_chart></not_a_chart>";
  let mut reader = create_reader(xml);
  assert!(parse_pattern_inner(&mut reader).is_err());
}

#[test]
fn should_end_on_end_chart_tag() {
  let xml = "<chart></chart>"; // Valid pattern.
  let mut reader = create_reader(xml);
  assert!(parse_pattern_inner(&mut reader).is_ok());

  let xml = "<chart>"; // Invalid pattern: the end chart tag is missing.
  let mut reader = create_reader(xml);
  assert!(parse_pattern_inner(&mut reader).is_err());
}

#[test]
fn reads_and_writes_display_settings() {
  let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<display_settings display_mode="Solid">
  <palette_settings columns_number="1" color_only="false" show_color_brands="true" show_color_names="true" show_color_numbers="true"/>
  <grid major_lines_interval="10">
    <minor_lines color="C8C8C8" thickness="0.072"/>
    <major_lines color="646464" thickness="0.072"/>
  </grid>
</display_settings>"#;

  let mut reader = create_reader(xml);
  reader.read_event().unwrap(); // Consume the XML declaration.
  let attributes = if let Event::Start(e) = reader.read_event().unwrap() {
    AttributesMap::try_from(e.attributes()).unwrap()
  } else {
    unreachable!()
  };
  let display_settings = parse_display_settings_inner(&mut reader, attributes).unwrap();
  assert_eq!(display_settings, DisplaySettings::default());

  let buffer = save_display_settings_to_vec(&display_settings).unwrap();

  let result = String::from_utf8(buffer).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn reads_and_writes_palette_settings() {
  let xml = r#"<palette_settings columns_number="1" color_only="false" show_color_brands="true" show_color_names="true" show_color_numbers="true"/>"#;

  let mut reader = create_reader(xml);
  let attributes = if let Event::Start(e) = reader.read_event().unwrap() {
    AttributesMap::try_from(e.attributes()).unwrap()
  } else {
    unreachable!()
  };
  let settings = read_palette_settings(attributes).unwrap();
  assert_eq!(settings, PaletteSettings::default());

  let mut writer = create_writer();
  write_palette_settings(&mut writer, &settings).unwrap();
  assert_eq!(xml, String::from_utf8(writer.into_inner().into_inner()).unwrap());
}

#[test]
fn reads_and_writes_grid() {
  let xml = r#"<grid major_lines_interval="10">
  <minor_lines color="C8C8C8" thickness="0.072"/>
  <major_lines color="646464" thickness="0.072"/>
</grid>"#;

  let mut reader = create_reader(xml);
  let attributes = if let Event::Start(e) = reader.read_event().unwrap() {
    AttributesMap::try_from(e.attributes()).unwrap()
  } else {
    unreachable!()
  };
  let grid = read_grid(&mut reader, attributes).unwrap();
  assert_eq!(grid, Grid::default());

  let mut writer = create_writer();
  write_grid(&mut writer, &grid).unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn reads_and_writes_publish_settings() {
  let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<publish_settings>
  <pdf monochrome="true" color="false" center_frames="false" enumerate_frames="true">
    <frame_options frame_width="30" frame_height="40" cell_size="14" preserved_overlap="3" show_grid_line_numbers="true" show_centering_marks="true"/>
  </pdf>
</publish_settings>"#;

  let mut reader = create_reader(xml);
  reader.read_event().unwrap(); // Consume the XML declaration.

  let publish_settings = parse_publish_settings_inner(&mut reader).unwrap();
  assert_eq!(publish_settings, PublishSettings::default());

  let buffer = save_publish_settings_to_vec(&publish_settings).unwrap();

  let result = String::from_utf8(buffer).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn reads_and_writes_pdf_export_options() {
  let xml = r#"<pdf monochrome="true" color="false" center_frames="false" enumerate_frames="true">
  <frame_options frame_width="30" frame_height="40" cell_size="14" show_grid_line_numbers="true" show_centering_marks="true"/>
</pdf>"#;

  let mut reader = create_reader(xml);
  let mut writer = create_writer();

  let attributes = if let Event::Start(e) = reader.read_event().unwrap() {
    AttributesMap::try_from(e.attributes()).unwrap()
  } else {
    unreachable!()
  };

  let pdf_export_options = read_pdf_export_options(&mut reader, attributes).unwrap();
  assert_eq!(
    pdf_export_options,
    PdfExportOptions {
      frame_options: ImageExportOptions {
        frame_size: Some((30, 40)),
        cell_size: 14.0,
        preserved_overlap: None,
        show_grid_line_numbers: true,
        show_centering_marks: true,
      },
      ..Default::default()
    }
  );

  write_pdf_export_options(&mut writer, &pdf_export_options).unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}

#[test]
fn reads_and_writes_image_export_options() {
  let xml = r#"<image cell_size="20" show_grid_line_numbers="false" show_centering_marks="false"/>"#;

  let mut reader = create_reader(xml);
  let mut writer = create_writer();

  let attributes = if let Event::Start(e) = reader.read_event().unwrap() {
    AttributesMap::try_from(e.attributes()).unwrap()
  } else {
    unreachable!()
  };

  let image_export_options = read_image_export_options(attributes).unwrap();
  assert_eq!(
    image_export_options,
    ImageExportOptions {
      frame_size: None,
      cell_size: 20.0,
      preserved_overlap: None,
      show_grid_line_numbers: false,
      show_centering_marks: false,
    }
  );

  write_image_export_options(&mut writer, "image", &image_export_options).unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}
