use embroiderly_pattern::{PatternProject, PdfExportOptions};

mod error;
pub use error::*;

pub mod logger;

pub mod pdf;

mod format;
pub use format::PatternExportFormat;

pub fn export_pattern<P: AsRef<std::path::Path>>(
  patproj: &PatternProject,
  file_path: P,
  options: PdfExportOptions,
  symbol_fonts_dir: Vec<std::path::PathBuf>,
) -> Result<()> {
  match PatternExportFormat::try_from(file_path.as_ref().extension())? {
    PatternExportFormat::Pdf => pdf::export_pattern(patproj, file_path, options, symbol_fonts_dir),
  }
  .map_err(Error::FailedToExport)
}
