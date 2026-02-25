mod error;
pub use error::*;

pub mod embproj;
pub mod oxs;
pub mod xsd;

mod format;
use embroiderly_pattern::PatternProject;
pub use format::PatternFormat;

pub fn parse_pattern(file_path: std::path::PathBuf) -> Result<PatternProject> {
  match PatternFormat::try_from(file_path.extension())? {
    PatternFormat::Xsd => xsd::parse_pattern(file_path),
    PatternFormat::Oxs => oxs::parse_pattern(file_path),
    PatternFormat::EmbProj => embproj::parse_pattern(file_path),
  }
  .map_err(Error::FailedToParse)
}

pub fn save_pattern(patproj: &PatternProject, file_path: &std::path::Path, package_info: &PackageInfo) -> Result<()> {
  match PatternFormat::try_from(file_path.extension())? {
    PatternFormat::Xsd => Err(Error::UnsupportedPatternType(PatternFormat::Xsd.to_string()).into()),
    PatternFormat::Oxs => oxs::save_pattern(patproj, file_path, package_info),
    PatternFormat::EmbProj => embproj::save_pattern(patproj, file_path),
  }
  .map_err(Error::FailedToParse)
}

pub struct PackageInfo {
  pub name: String,
  pub version: String,
}
