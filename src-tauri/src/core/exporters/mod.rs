pub mod pdf;

mod format;
pub use format::PatternExportFormat;

use crate::core::pattern::PatternProject;
use crate::error::{PatternError, Result};

pub fn export_pattern(
  patproj: &PatternProject,
  file_path: std::path::PathBuf,
  text_fonts: Vec<std::path::PathBuf>,
  symbol_fonts: Vec<std::path::PathBuf>,
) -> Result<()> {
  match PatternExportFormat::try_from(file_path.extension())? {
    PatternExportFormat::Pdf => pdf::export_pattern(patproj, file_path, text_fonts, symbol_fonts),
  }
  .map_err(|e| PatternError::FailedToExport(e).into())
}
