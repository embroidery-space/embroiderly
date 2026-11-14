use std::io::{Read, Seek, Write as _};

use anyhow::Result;
use embroiderly_pattern::{EmbroiderlyProject, PatternPdf, PdfAsset, ReferenceImage};
use zip::ZipArchive;
use zip::result::ZipError;

fn read_entry<R: Read + Seek>(archive: &mut ZipArchive<R>, name: &str) -> Result<Vec<u8>, ZipError> {
  let mut file = archive.by_name(name)?;
  let mut data = Vec::with_capacity(file.size() as usize);

  file.read_to_end(&mut data)?;

  Ok(data)
}

fn read_optional_entry<R: Read + Seek>(archive: &mut ZipArchive<R>, name: &str) -> Result<Option<Vec<u8>>> {
  match read_entry(archive, name) {
    Ok(data) => Ok(Some(data)),
    Err(ZipError::FileNotFound) => Ok(None),
    Err(e) => Err(e.into()),
  }
}

#[tracing::instrument(name = "parse_embproj", level = "debug", skip_all)]
pub fn parse_pattern(data: &[u8]) -> Result<EmbroiderlyProject> {
  let cursor = std::io::Cursor::new(data);
  let mut archive = ZipArchive::new(cursor)?;

  let file_names: Vec<String> = archive
    .file_names()
    .filter_map(|res| res.ok().map(std::borrow::Cow::into_owned))
    .collect();

  let pattern = serde_json::from_slice(&read_entry(&mut archive, "pattern.json")?)?;
  let pattern_pdf = {
    let mut pattern_pdf = PatternPdf::default();

    for name in &file_names {
      if name == "pdf_export/template.typ" {
        let bytes = read_entry(&mut archive, name)?;
        pattern_pdf.template = String::from_utf8(bytes)?;
      } else if let Some(rel_path) = name.strip_prefix("pdf_export/files/")
        && !rel_path.is_empty()
      {
        pattern_pdf.files.push(PdfAsset {
          content: read_entry(&mut archive, name)?,
          file_name: rel_path.to_owned(),
        });
      } else if let Some(rel_path) = name.strip_prefix("pdf_export/fonts/")
        && !rel_path.is_empty()
      {
        pattern_pdf.fonts.push(PdfAsset {
          content: read_entry(&mut archive, name)?,
          file_name: rel_path.to_owned(),
        });
      }
    }

    pattern_pdf
  };

  let display_settings = match read_optional_entry(&mut archive, "display_settings.json")? {
    Some(bytes) => serde_json::from_slice(&bytes)?,
    None => Default::default(),
  };

  // Since we store the reference image with the original extension,
  // we don't know the exact file name, so we have to search for it.
  let reference_image =
    if let Some(ref_img_name) = file_names.into_iter().find(|name| name.starts_with("reference_image.")) {
      let image_bytes = read_entry(&mut archive, &ref_img_name)?;
      let settings = match read_optional_entry(&mut archive, "reference_image_settings.json")? {
        Some(bytes) => Some(serde_json::from_slice(&bytes)?),
        None => None,
      };
      Some(ReferenceImage::new(image_bytes, settings))
    } else {
      None
    };

  Ok(
    EmbroiderlyProject::builder(pattern)
      .pattern_pdf(pattern_pdf)
      .display_settings(display_settings)
      .reference_image(reference_image)
      .build(),
  )
}

#[tracing::instrument(name = "save_embproj", level = "debug", skip_all)]
pub fn save_pattern(embproj: &EmbroiderlyProject) -> Result<Vec<u8>> {
  let mut zip = zip::ZipWriter::new(std::io::Cursor::new(Vec::new()));
  let options = zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

  zip.start_file("pattern.json", options)?;
  zip.write_all(&serde_json::to_vec(&embproj.pattern)?)?;

  zip.start_file("display_settings.json", options)?;
  zip.write_all(&serde_json::to_vec(&embproj.display_settings)?)?;

  if let Some(ref image) = embproj.reference_image {
    let image_file_name = format!("reference_image.{}", image.format.extensions_str()[0]);
    zip.start_file(image_file_name, options)?;
    zip.write_all(&image.content)?;

    zip.start_file("reference_image_settings.json", options)?;
    zip.write_all(&serde_json::to_vec(&image.settings)?)?;
  }

  zip.start_file("pdf_export/template.typ", options)?;
  zip.write_all(embproj.pattern_pdf.template.as_bytes())?;

  for asset in embproj.pattern_pdf.files.iter() {
    zip.start_file(format!("pdf_export/files/{}", asset.file_name), options)?;
    zip.write_all(asset.content.as_slice())?;
  }

  for asset in embproj.pattern_pdf.fonts.iter() {
    zip.start_file(format!("pdf_export/fonts/{}", asset.file_name), options)?;
    zip.write_all(asset.content.as_slice())?;
  }

  Ok(zip.finish()?.into_inner())
}
