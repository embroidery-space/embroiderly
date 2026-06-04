use super::*;

fn load_fixture() -> EmbroiderlyProject {
  let file_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("./testdata/piggies.embproj");
  embroiderly_parsers::embproj::parse_pattern(&std::fs::read(file_path).unwrap()).unwrap()
}

mod preparation {
  use super::*;

  #[test]
  fn flattens_layers_with_palette_in_visual_order() {
    let mut pattern = load_fixture().pattern;
    assert!(pattern.palette.len() > 1, "fixture should have a multi-color palette");

    // Force a non-trivial display order (reverse) so the remap is actually exercised.
    let count = pattern.palette.len() as u32;
    pattern.palette.set_positions((0..count).rev().collect());

    let original_palette: Vec<PaletteItem> = pattern.palette.as_ref().to_vec();
    let original_layer = pattern.flatten_visible_layers();

    let (palette, layer) = flatten_layers_with_palette_in_visual_order(&pattern);

    // The palette is now physically in display order, holding every item once.
    assert_eq!(palette.len(), original_palette.len());
    for (display_index, item) in palette.iter().enumerate() {
      assert_eq!(
        item.color,
        original_palette[original_palette.len() - 1 - display_index].color
      );
    }

    // Coordinates are untouched, and every remapped stitch still resolves to its original color.
    assert!(
      !original_layer.fullstitches.is_empty(),
      "fixture should have full stitches"
    );
    for (original, remapped) in original_layer.fullstitches.iter().zip(layer.fullstitches.iter()) {
      assert_eq!((original.x, original.y), (remapped.x, remapped.y));
      assert_eq!(
        original_palette[original.palindex as usize].color,
        palette[remapped.palindex as usize].color,
      );
    }
  }

  #[test]
  fn composes_expected_pattern_json() {
    let embproj = load_fixture();

    let pattern_json = compose_pattern_json(&embproj, PdfExportOptions::default()).unwrap();
    let value: serde_json::Value = serde_json::from_slice(&pattern_json).unwrap();

    for key in [
      "info",
      "fabric",
      "grid",
      "palette",
      "fullstitches",
      "partstitches",
      "linestitches",
      "nodestitches",
      "specialstitches",
      "specialStitchModels",
      "pdfExportOptions",
    ] {
      assert!(value.get(key).is_some(), r#"missing key "{key}" in pattern.json"#);
    }

    assert_eq!(
      value["palette"].as_array().unwrap().len(),
      embproj.pattern.palette.len()
    );
  }
}

mod export {
  use super::*;

  #[test]
  fn exports_pattern_to_pdf() {
    let embproj = load_fixture();
    let fonts = vec![
      std::fs::read(
        std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../app/public/fonts/Ursasoftware.ttf"),
      )
      .unwrap(),
    ];

    for variant in [PdfVariant::Monochrome, PdfVariant::Color] {
      let expected = std::fs::read(
        std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(format!("./testdata/piggies.{variant}.pdf")),
      )
      .unwrap();
      let exported = export_pattern(embproj.clone(), PdfExportOptions::default(), variant, fonts.clone()).unwrap();
      assert_eq!(expected, exported, "pdf export for {variant} doesn't match")
    }
  }
}
