use std::io;

use anyhow::Result;
use embroiderly_pattern::*;
use quick_xml::events::{BytesDecl, Event};
use quick_xml::{Reader, Writer};

use crate::oxs::utils::AttributesMap;

#[cfg(test)]
#[path = "publish_settings.test.rs"]
mod tests;

pub fn parse_publish_settings_from_reader<R: io::BufRead>(reader: &mut R) -> Result<PublishSettings> {
  let mut reader = Reader::from_reader(reader);
  let reader_config = reader.config_mut();
  reader_config.expand_empty_elements = true;
  reader_config.check_end_names = true;
  reader_config.trim_text(true);

  let mut buf = Vec::new();
  let publish_settings = loop {
    match reader
      .read_event_into(&mut buf)
      .map_err(|e| anyhow::anyhow!("Error at position {}: {e:?}", reader.error_position()))?
    {
      Event::Start(ref e) if e.name().as_ref() == b"publish_settings" => {
        break parse_publish_settings_inner(&mut reader)?;
      }
      Event::Eof => anyhow::bail!("Unexpected EOF. It seems that the `publish_settings` tag is not found."),
      _ => {}
    }
    buf.clear();
  };

  Ok(publish_settings)
}

fn parse_publish_settings_inner<R: io::BufRead>(reader: &mut Reader<R>) -> Result<PublishSettings> {
  let mut publish_settings = PublishSettings::default();

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      #[allow(clippy::single_match)]
      Event::Start(ref e) => match e.name().as_ref() {
        b"pdf" => {
          let pdf_attributes = AttributesMap::try_from(e.attributes())?;
          publish_settings.pdf = read_pdf_export_options(reader, pdf_attributes)?;
        }
        _ => {}
      },
      Event::End(ref e) if e.name().as_ref() == b"publish_settings" => break,
      Event::Eof => anyhow::bail!("Unexpected EOF. The end of the `publish_settings` tag is not found."),
      _ => {}
    }
    buf.clear();
  }

  Ok(publish_settings)
}

pub fn save_publish_settings_to_vec(publish_settings: &PublishSettings) -> Result<Vec<u8>> {
  // In the development mode, we want to have a pretty-printed XML file for easy debugging.
  #[cfg(debug_assertions)]
  let mut writer = Writer::new_with_indent(Vec::new(), b' ', 2);
  #[cfg(not(debug_assertions))]
  let mut writer = Writer::new(Vec::new());

  writer.write_event(Event::Decl(BytesDecl::new("1.0", Some("UTF-8"), None)))?;
  writer
    .create_element("publish_settings")
    .write_inner_content(|writer| {
      write_pdf_export_options(writer, &publish_settings.pdf)?;
      Ok(())
    })?;

  Ok(writer.into_inner())
}

fn read_pdf_export_options<R: io::BufRead>(
  reader: &mut Reader<R>,
  attributes: AttributesMap,
) -> Result<PdfExportOptions> {
  let mut pdf = PdfExportOptions {
    monochrome: attributes.get_bool("monochrome").unwrap_or_default(),
    color: attributes.get_bool("color").unwrap_or_default(),
    center_frames: attributes.get_bool("center_frames").unwrap_or_default(),
    enumerate_frames: attributes.get_bool("enumerate_frames").unwrap_or_default(),
    ..Default::default()
  };

  let mut buf = Vec::new();
  loop {
    #[allow(clippy::single_match)]
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) => match e.name().as_ref() {
        b"frame_options" => {
          let attributes = AttributesMap::try_from(e.attributes())?;
          pdf.frame_options = read_image_export_options(attributes)?;
        }
        _ => {}
      },
      Event::End(ref e) if e.name().as_ref() == b"pdf" => break,
      _ => {}
    }
    buf.clear();
  }

  Ok(pdf)
}

fn write_pdf_export_options<W: io::Write>(writer: &mut Writer<W>, pdf: &PdfExportOptions) -> io::Result<()> {
  writer
    .create_element("pdf")
    .with_attributes([
      ("monochrome", pdf.monochrome.to_string().as_str()),
      ("color", pdf.color.to_string().as_str()),
      ("center_frames", pdf.center_frames.to_string().as_str()),
      ("enumerate_frames", pdf.enumerate_frames.to_string().as_str()),
    ])
    .write_inner_content(|writer| {
      write_image_export_options(writer, "frame_options", &pdf.frame_options)?;
      Ok(())
    })?;
  Ok(())
}

fn read_image_export_options(attributes: AttributesMap) -> Result<ImageExportOptions> {
  let image = ImageExportOptions {
    frame_size: if let Some(frame_width) = attributes.get_parsed("frame_width") {
      let frame_height = attributes.get_parsed("frame_height").unwrap_or(frame_width);
      Some((frame_width, frame_height))
    } else {
      None
    },
    cell_size: attributes
      .get_parsed("cell_size")
      .unwrap_or(ImageExportOptions::DEFAULT_CELL_SIZE),
    preserved_overlap: attributes.get_parsed("preserved_overlap"),
    show_grid_line_numbers: attributes.get_bool("show_grid_line_numbers").unwrap_or_default(),
    show_centering_marks: attributes.get_bool("show_centering_marks").unwrap_or_default(),
  };

  Ok(image)
}

fn write_image_export_options<W: io::Write>(
  writer: &mut Writer<W>,
  element: &str,
  image: &ImageExportOptions,
) -> io::Result<()> {
  let mut attributes = Vec::new();

  if let Some(frame_size) = image.frame_size {
    attributes.push(("frame_width", frame_size.0.to_string()));
    attributes.push(("frame_height", frame_size.1.to_string()));
  }
  attributes.push(("cell_size", image.cell_size.to_string()));

  if let Some(preserved_overlap) = image.preserved_overlap {
    attributes.push(("preserved_overlap", preserved_overlap.to_string()));
  }

  attributes.push(("show_grid_line_numbers", image.show_grid_line_numbers.to_string()));
  attributes.push(("show_centering_marks", image.show_centering_marks.to_string()));

  let attributes = attributes.iter().map(|(k, v)| (*k, v.as_str())).collect::<Vec<_>>();
  writer
    .create_element(element)
    .with_attributes(attributes)
    .write_empty()?;

  Ok(())
}
