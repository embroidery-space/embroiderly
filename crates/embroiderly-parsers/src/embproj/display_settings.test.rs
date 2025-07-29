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
fn reads_and_writes_display_settings() {
  let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<display_settings display_mode="Solid" default_symbol_font="Ursasoftware" show_symbols="false">
  <palette_settings columns_number="1" color_only="false" show_color_brands="true" show_color_names="true" show_color_numbers="true"/>
  <grid major_lines_interval="10">
    <minor_lines color="C8C8C8" thickness="0.072"/>
    <major_lines color="646464" thickness="0.072"/>
  </grid>
  <layers_visibility fullstitches="true" petitestitches="true" halfstitches="true" quarterstitches="true" backstitches="true" straightstitches="true" frenchknots="true" beads="true" specialstitches="true" grid="true" rulers="true"/>
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
fn reads_and_writes_layers_visibility() {
  let xml = r#"<layers_visibility fullstitches="true" petitestitches="true" halfstitches="true" quarterstitches="true" backstitches="true" straightstitches="true" frenchknots="true" beads="true" specialstitches="true" grid="true" rulers="true"/>"#;

  let mut reader = create_reader(xml);
  let attributes = if let Event::Start(e) = reader.read_event().unwrap() {
    AttributesMap::try_from(e.attributes()).unwrap()
  } else {
    unreachable!()
  };

  let layers_visibility = read_layers_visibility(attributes).unwrap();
  assert_eq!(layers_visibility, LayersVisibility::default());

  let mut writer = create_writer();
  write_layers_visibility(&mut writer, &layers_visibility).unwrap();

  let result = String::from_utf8(writer.into_inner().into_inner()).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}
