use std::io::Write;

use anyhow::Result;
use embroiderly_pattern::PatternProject;

use crate::{PackageInfo, oxs};

pub fn parse_pattern(file_path: std::path::PathBuf) -> Result<PatternProject> {
  log::info!("Parsing the EMBPROJ pattern file");

  let mut archive = zip::ZipArchive::new(std::fs::File::open(&file_path)?)?;

  // `quick-xml` doesn't support reading from a `ZipFile`'s directly because it doesn't implement `std::io::BufRead` trait,
  // so we extract all the files to a temporary directory to read them as regular files.
  let temp = tempfile::Builder::new().tempdir()?.path().to_path_buf();
  archive.extract(&temp)?;

  let mut patproj = oxs::parse_pattern(temp.join("pattern.oxs"))?;
  patproj.file_path = file_path;

  let display_settings_path = temp.join("display_settings.xml");
  if display_settings_path.exists() {
    patproj.display_settings = oxs::parse_display_settings(display_settings_path)?;
  }

  let publish_settings_path = temp.join("publish_settings.xml");
  if publish_settings_path.exists() {
    patproj.publish_settings = oxs::parse_publish_settings(publish_settings_path)?;
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
  zip.write_all(&oxs::save_pattern_to_vec(patproj, package_info)?)?;

  zip.start_file("display_settings.xml", options)?;
  zip.write_all(&oxs::save_display_settings_to_vec(&patproj.display_settings)?)?;

  zip.start_file("publish_settings.xml", options)?;
  zip.write_all(&oxs::save_publish_settings_to_vec(&patproj.publish_settings)?)?;

  zip.finish()?;
  Ok(())
}
