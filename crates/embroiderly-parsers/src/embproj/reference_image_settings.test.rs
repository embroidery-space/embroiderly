use super::*;

#[test]
fn reads_and_writes_reference_image_settings() {
  let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<reference_image_settings x="0" y="0" width="0" height="0"/>"#;

  let reference_image_settings =
    parse_reference_image_settings_from_reader(&mut std::io::Cursor::new(xml.as_bytes())).unwrap();
  assert_eq!(reference_image_settings, ReferenceImageSettings::default());

  let buffer = save_reference_image_settings_to_vec(&reference_image_settings).unwrap();

  let result = String::from_utf8(buffer).unwrap();
  let diff = prettydiff::diff_lines(&result, xml);
  assert!(diff.diff().len() == 1, "Diff:\n{diff}");
}
