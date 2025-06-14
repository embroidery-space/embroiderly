pub mod pdf;
pub mod svg;

mod format;
use embroiderly_pattern::PatternProject;
pub use format::PatternExportFormat;

use crate::error::{PatternError, Result};

pub fn export_pattern<P: AsRef<std::path::Path>>(
  patproj: &PatternProject,
  file_path: P,
  text_fonts: Vec<std::path::PathBuf>,
  symbol_fonts: Vec<std::path::PathBuf>,
) -> Result<()> {
  match PatternExportFormat::try_from(file_path.as_ref().extension())? {
    PatternExportFormat::Pdf => pdf::export_pattern(patproj, file_path, text_fonts, symbol_fonts),
  }
  .map_err(|e| PatternError::FailedToExport(e).into())
}
