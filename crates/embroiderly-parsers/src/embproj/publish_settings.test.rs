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
