use std::io::{Read as _, Write as _};

use anyhow::Result;
use embroiderly_pattern::{EmbroiderlyProject, PatternPdf, PdfAsset, ReferenceImage};

/// Reads a `ZipFile` and returns a buffered reader for its content.
macro_rules! read_zip_file {
  ($archive:expr, $name:expr) => {{
    $archive.by_name($name).map(|mut file| {
      let mut data = Vec::new();
      if let Err(e) = file.read_to_end(&mut data) {
        tracing::error!("Failed to read zip file {}: {}", $name, e);
      }

      data
    })
  }};
}

#[tracing::instrument(name = "parse_embproj", level = "debug", skip_all)]
pub fn parse_pattern(data: &[u8]) -> Result<EmbroiderlyProject> {
  let cursor = std::io::Cursor::new(data);
  let mut archive = zip::ZipArchive::new(cursor)?;

  let pattern = serde_json::from_slice(&read_zip_file!(archive, "pattern.json")?)?;
  let pattern_pdf = {
    let mut pattern_pdf = PatternPdf::default();

    let pdf_export_files: Vec<String> = archive
      .file_names()
      .filter_map(|n| match n {
        Ok(s) if s.starts_with("pdf_export/") => Some(s.to_string()),
        _ => None,
      })
      .collect();

    if let Some(template_file_name) = pdf_export_files.iter().find(|&s| s == "pdf_export/template.typ") {
      pattern_pdf.template = String::from_utf8(read_zip_file!(archive, template_file_name)?)?;
    }

    for asset_file_name in pdf_export_files.iter().filter(|s| s.starts_with("pdf_export/files/")) {
      pattern_pdf.files.push(PdfAsset {
        content: read_zip_file!(archive, asset_file_name)?,
        file_name: asset_file_name.strip_prefix("pdf_export/files/").unwrap().to_owned(),
      });
    }

    for asset_file_name in pdf_export_files.iter().filter(|s| s.starts_with("pdf_export/fonts/")) {
      pattern_pdf.fonts.push(PdfAsset {
        content: read_zip_file!(archive, asset_file_name)?,
        file_name: asset_file_name.strip_prefix("pdf_export/fonts/").unwrap().to_owned(),
      });
    }

    pattern_pdf
  };

  let display_settings = match read_zip_file!(archive, "display_settings.json") {
    Ok(file) => serde_json::from_slice(&file)?,
    Err(zip::result::ZipError::FileNotFound) => Default::default(),
    Err(e) => return Err(e.into()),
  };

  // Since we store the reference image with the original extension,
  // we don't know the exact file name, so we have to search for it.
  let reference_image = {
    let image_file_name = archive
      .file_names()
      .filter_map(|n| n.map(|v| v.to_string()).ok())
      .find(|name| name.starts_with("reference_image."));
    match image_file_name {
      Some(image_file_name) => {
        let image_file = read_zip_file!(archive, image_file_name.as_str());
        let settings_file = read_zip_file!(archive, "reference_image_settings.json");

        match image_file.and_then(|i| settings_file.map(|s| (i, s))) {
          Ok((image_file, settings_file)) => {
            let settings = serde_json::from_slice(&settings_file)?;
            Some(ReferenceImage::new(image_file, Some(settings)))
          }
          Err(zip::result::ZipError::FileNotFound) => None,
          Err(e) => return Err(e.into()),
        }
      }
      None => None,
    }
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
