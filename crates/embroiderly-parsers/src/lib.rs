use embroiderly_pattern::{BrandPaletteItem, PatternProject};

mod error;
pub use error::*;

mod format;
pub use format::{PaletteFormat, PatternFormat};

pub mod embproj;
pub mod oxs;
pub mod pmaker;
pub mod ursa;
pub mod xspro;

mod utils;

pub fn parse_pattern(data: &[u8], file_name: &str) -> Result<PatternProject> {
  match PatternFormat::try_from(file_name)? {
    PatternFormat::Xsd => pmaker::parse_pattern(data),
    PatternFormat::Oxs => oxs::parse_pattern(data),
    PatternFormat::EmbProj => embproj::parse_pattern(data),
  }
  .map_err(Error::FailedToParse)
}

pub fn save_pattern(patproj: &PatternProject, format: PatternFormat, package_info: &PackageInfo) -> Result<Vec<u8>> {
  match format {
    PatternFormat::Xsd => Err(Error::UnsupportedPatternType(PatternFormat::Xsd.to_string()).into()),
    PatternFormat::Oxs => oxs::save_pattern(patproj, package_info),
    PatternFormat::EmbProj => embproj::save_pattern(patproj),
  }
  .map_err(Error::FailedToParse)
}

pub fn parse_palette(data: &[u8], file_name: &str) -> Result<Vec<BrandPaletteItem>> {
  match PaletteFormat::try_from(file_name)? {
    PaletteFormat::Pmaker => pmaker::parse_palette(data),
    PaletteFormat::Ursa => ursa::parse_palette(data),
    PaletteFormat::Xspro => xspro::parse_palette(data),
  }
  .map_err(Error::FailedToParse)
}

pub struct PackageInfo {
  pub name: String,
  pub version: String,
}
