use std::io::{Read, Write};

use anyhow::Result;
use embroiderly_pattern::PatternProject;

use crate::PackageInfo;
use crate::oxs::{parse_pattern_from_reader, save_pattern_to_vec};

mod display_settings;
use display_settings::{parse_display_settings_from_reader, save_display_settings_to_vec};

mod publish_settings;
use publish_settings::{parse_publish_settings_from_reader, save_publish_settings_to_vec};

/// Reads a `ZipFile` and returns a buffered reader for its content.
macro_rules! read_zip_file {
  ($archive:expr, $name:expr) => {{
    $archive.by_name($name).map(|mut file| {
      let mut buf = Vec::new();
      if let Err(e) = file.read_to_end(&mut buf) {
        log::error!("Failed to read zip file {}: {}", $name, e);
      }

      std::io::BufReader::new(std::io::Cursor::new(buf))
    })
  }};
}

pub fn parse_pattern<P: AsRef<std::path::Path>>(file_path: P) -> Result<PatternProject> {
  log::info!("Parsing the EMBPROJ pattern file");
  let file_path = file_path.as_ref();
  let file = std::fs::File::open(file_path)?;
  let mut archive = zip::ZipArchive::new(file)?;

  let mut patproj = parse_pattern_from_reader(&mut read_zip_file!(archive, "pattern.oxs")?)?;
  patproj.display_settings = match read_zip_file!(archive, "display_settings.xml") {
    Ok(mut file) => parse_display_settings_from_reader(&mut file)?,
    Err(zip::result::ZipError::FileNotFound) => Default::default(),
    Err(e) => return Err(e.into()),
  };
  patproj.publish_settings = match read_zip_file!(archive, "publish_settings.xml") {
    Ok(mut file) => parse_publish_settings_from_reader(&mut file)?,
    Err(zip::result::ZipError::FileNotFound) => Default::default(),
    Err(e) => return Err(e.into()),
  };

  if patproj.pattern.info.title.is_empty() {
    patproj.pattern.info.title = file_path.file_name().unwrap().to_string_lossy().to_string();
  }

  Ok(patproj)
}

pub fn save_pattern(patproj: &PatternProject, package_info: &PackageInfo) -> Result<()> {
  log::info!("Saving the EMBPROJ pattern file");
  let file = std::fs::OpenOptions::new()
    .create(true)
    .write(true)
    .truncate(true)
    .open(&patproj.file_path)?;
  let mut zip = zip::ZipWriter::new(file);
  let options = zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Zstd);

  zip.start_file("pattern.oxs", options)?;
  zip.write_all(&save_pattern_to_vec(patproj, package_info)?)?;

  zip.start_file("display_settings.xml", options)?;
  zip.write_all(&save_display_settings_to_vec(&patproj.display_settings)?)?;

  zip.start_file("publish_settings.xml", options)?;
  zip.write_all(&save_publish_settings_to_vec(&patproj.publish_settings)?)?;

  zip.finish()?;
  Ok(())
}
