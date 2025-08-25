use std::io;

use anyhow::Result;
use embroiderly_pattern::*;
use quick_xml::events::{BytesDecl, Event};
use quick_xml::{Reader, Writer};

use crate::oxs::utils::AttributesMap;

#[cfg(test)]
#[path = "reference_image_settings.test.rs"]
mod tests;

pub fn parse_reference_image_settings_from_reader<R: io::BufRead>(reader: &mut R) -> Result<ReferenceImageSettings> {
  let mut reader = Reader::from_reader(reader);
  let reader_config = reader.config_mut();
  reader_config.expand_empty_elements = true;
  reader_config.check_end_names = true;
  reader_config.trim_text(true);

  let mut reference_image_settings = ReferenceImageSettings::default();

  let mut buf = Vec::new();
  loop {
    match reader
      .read_event_into(&mut buf)
      .map_err(|e| anyhow::anyhow!("Error at position {}: {e:?}", reader.error_position()))?
    {
      Event::Start(ref e) if e.name().as_ref() == b"reference_image_settings" => {
        let attributes = AttributesMap::try_from(e.attributes())?;

        reference_image_settings.x = attributes.get_parsed("x").unwrap_or_default();
        reference_image_settings.y = attributes.get_parsed("y").unwrap_or_default();
        reference_image_settings.width = attributes.get_parsed("width").unwrap_or_default();
        reference_image_settings.height = attributes.get_parsed("height").unwrap_or_default();
        reference_image_settings.rotation = attributes.get_parsed("rotation").unwrap_or_default();
      }
      Event::End(ref e) if e.name().as_ref() == b"reference_image_settings" => break,
      Event::Eof => anyhow::bail!("Unexpected EOF. It seems that the `reference_image_settings` tag is not found."),
      _ => {}
    }
    buf.clear();
  }

  Ok(reference_image_settings)
}

pub fn save_reference_image_settings_to_vec(settings: &ReferenceImageSettings) -> Result<Vec<u8>> {
  // In the development mode, we want to have a pretty-printed XML file for easy debugging.
  #[cfg(debug_assertions)]
  let mut writer = Writer::new_with_indent(Vec::new(), b' ', 2);
  #[cfg(not(debug_assertions))]
  let mut writer = Writer::new(Vec::new());

  writer.write_event(Event::Decl(BytesDecl::new("1.0", Some("UTF-8"), None)))?;
  writer
    .create_element("reference_image_settings")
    .with_attributes([
      ("x", settings.x.to_string().as_str()),
      ("y", settings.y.to_string().as_str()),
      ("width", settings.width.to_string().as_str()),
      ("height", settings.height.to_string().as_str()),
      ("rotation", settings.rotation.to_string().as_str()),
    ])
    .write_empty()?;

  Ok(writer.into_inner())
}
