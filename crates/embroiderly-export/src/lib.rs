use embroiderly_pattern::PatternProject;

mod error;
pub use error::*;

pub mod pdf;
pub mod svg;

mod format;
pub use format::PatternExportFormat;

pub fn export_pattern<P: AsRef<std::path::Path>>(
  patproj: &PatternProject,
  file_path: P,
  symbol_fonts_dir: std::path::PathBuf,
) -> Result<()> {
  match PatternExportFormat::try_from(file_path.as_ref().extension())? {
    PatternExportFormat::Pdf => pdf::export_pattern(patproj, file_path, symbol_fonts_dir, Default::default()),
  }
  .map_err(Error::FailedToExport)
}
