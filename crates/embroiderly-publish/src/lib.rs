use embroiderly_pattern::{PatternProject, PdfExportOptions};

mod error;
pub use error::*;

pub mod pdf;

mod format;
pub use format::PatternExportFormat;

pub fn export_pattern(
  patproj: &PatternProject,
  file_path: std::path::PathBuf,
  options: PdfExportOptions,
  symbol_fonts_dir: Vec<std::path::PathBuf>,
) -> Result<()> {
  match PatternExportFormat::try_from(file_path.extension())? {
    PatternExportFormat::Pdf => pdf::export_pattern(patproj, file_path, options, symbol_fonts_dir),
  }
  .map_err(Error::FailedToExport)
}
