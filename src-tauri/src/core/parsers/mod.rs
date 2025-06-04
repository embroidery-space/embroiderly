pub mod embproj;
pub mod oxs;
pub mod xsd;

mod format;
pub use format::PatternFormat;

use crate::core::pattern::PatternProject;
use crate::error::{PatternError, Result};

pub fn parse_pattern(file_path: std::path::PathBuf) -> Result<PatternProject> {
  match PatternFormat::try_from(file_path.extension())? {
    PatternFormat::Xsd => xsd::parse_pattern(file_path),
    PatternFormat::Oxs => oxs::parse_pattern(file_path),
    PatternFormat::EmbProj => embproj::parse_pattern(file_path),
  }
  .map_err(|e| PatternError::FailedToParse(e).into())
}

pub fn save_pattern(
  patproj: &PatternProject,
  package_info: &tauri::PackageInfo,
  format: Option<PatternFormat>,
) -> Result<()> {
  let file_path = match format {
    Some(format) => patproj.file_path.with_extension(format.to_string()),
    None => patproj.file_path.clone(),
  };
  match PatternFormat::try_from(file_path.extension())? {
    PatternFormat::Xsd => Err(PatternError::UnsupportedPatternTypeForSaving(PatternFormat::Xsd.to_string()).into()),
    PatternFormat::Oxs => oxs::save_pattern(patproj, package_info),
    PatternFormat::EmbProj => embproj::save_pattern(patproj, package_info),
  }
  .map_err(|e| PatternError::FailedToParse(e).into())
}
