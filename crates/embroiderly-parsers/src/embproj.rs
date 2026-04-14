use std::io::{Read as _, Write as _};

use anyhow::Result;
use embroiderly_pattern::{PatternProject, ReferenceImage};

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

#[tracing::instrument(name = "parse_embproj", skip_all)]
pub fn parse_pattern(data: &[u8]) -> Result<PatternProject> {
  let cursor = std::io::Cursor::new(data);
  let mut archive = zip::ZipArchive::new(cursor)?;

  let pattern = serde_json::from_slice(&read_zip_file!(archive, "pattern.json")?)?;

  let display_settings = match read_zip_file!(archive, "display_settings.json") {
    Ok(file) => serde_json::from_slice(&file)?,
    Err(zip::result::ZipError::FileNotFound) => Default::default(),
    Err(e) => return Err(e.into()),
  };
  let publish_settings = match read_zip_file!(archive, "publish_settings.json") {
    Ok(file) => serde_json::from_slice(&file)?,
    Err(zip::result::ZipError::FileNotFound) => Default::default(),
    Err(e) => return Err(e.into()),
  };

  // Since we store the reference image with the original extension,
  // we don't know the exact file name, so we have to search for it.
  let file_names = archive.file_names().map(ToString::to_string).collect::<Vec<_>>();
  let reference_image =
    if let Some(image_file_name) = file_names.iter().find(|name| name.starts_with("reference_image.")) {
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
    } else {
      None
    };

  let mut patproj = PatternProject::builder(pattern)
    .display_settings(display_settings)
    .publish_settings(publish_settings);

  if let Some(reference_image) = reference_image {
    patproj = patproj.reference_image(reference_image);
  }

  Ok(patproj.build())
}

#[tracing::instrument(name = "save_embproj", skip_all)]
pub fn save_pattern(patproj: &PatternProject) -> Result<Vec<u8>> {
  let mut zip = zip::ZipWriter::new(std::io::Cursor::new(Vec::new()));
  let options = zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Zstd);

  zip.start_file("pattern.json", options)?;
  zip.write_all(&serde_json::to_vec(&patproj.pattern)?)?;

  zip.start_file("display_settings.json", options)?;
  zip.write_all(&serde_json::to_vec(&patproj.display_settings)?)?;

  zip.start_file("publish_settings.json", options)?;
  zip.write_all(&serde_json::to_vec(&patproj.publish_settings)?)?;

  if let Some(ref image) = patproj.reference_image {
    let image_file_name = format!("reference_image.{}", image.format.extensions_str()[0]);
    zip.start_file(image_file_name, options)?;
    zip.write_all(&image.content)?;

    zip.start_file("reference_image_settings.json", options)?;
    zip.write_all(&serde_json::to_vec(&image.settings)?)?;
  }

  Ok(zip.finish()?.into_inner())
}
