use std::io::{Read as _, Write as _};

use anyhow::Result;
use embroiderly_pattern::{PatternProject, ReferenceImage};

/// Reads a `ZipFile` and returns a buffered reader for its content.
macro_rules! read_zip_file {
  ($archive:expr, $name:expr) => {{
    $archive.by_name($name).map(|mut file| {
      let mut buf = Vec::new();
      if let Err(e) = file.read_to_end(&mut buf) {
        tracing::error!("Failed to read zip file {}: {}", $name, e);
      }

      std::io::BufReader::new(std::io::Cursor::new(buf))
    })
  }};
}

#[tracing::instrument(name = "parse_embproj", skip_all)]
pub fn parse_pattern<P: AsRef<std::path::Path>>(file_path: P) -> Result<PatternProject> {
  let file_path = file_path.as_ref();
  let file = std::fs::File::open(file_path)?;
  let mut archive = zip::ZipArchive::new(file)?;

  let pattern = serde_json::from_reader(read_zip_file!(archive, "pattern.json")?)?;

  let display_settings = match read_zip_file!(archive, "display_settings.json") {
    Ok(file) => serde_json::from_reader(file)?,
    Err(zip::result::ZipError::FileNotFound) => Default::default(),
    Err(e) => return Err(e.into()),
  };
  let publish_settings = match read_zip_file!(archive, "publish_settings.json") {
    Ok(file) => serde_json::from_reader(file)?,
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
          let image = image_file.into_inner().into_inner();
          let settings = serde_json::from_reader(settings_file)?;
          Some(ReferenceImage::new(image, Some(settings)))
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

  let mut patproj = patproj.build();

  if patproj.pattern.info.title.is_empty() {
    patproj.pattern.info.title = file_path.file_name().unwrap().to_string_lossy().to_string();
  }

  Ok(patproj)
}

#[tracing::instrument(name = "save_embproj", skip_all)]
pub fn save_pattern(patproj: &PatternProject, file_path: &std::path::Path) -> Result<()> {
  let file = std::fs::OpenOptions::new()
    .create(true)
    .write(true)
    .truncate(true)
    .open(file_path)?;
  let mut zip = zip::ZipWriter::new(file);
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

  zip.finish()?;
  Ok(())
}
