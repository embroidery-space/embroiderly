use embroiderly_pattern::{PatternProject, PdfExportOptions};

mod error;
pub use error::*;

pub mod logger;
pub mod telemetry;

pub mod pdf;
pub mod svg;

mod format;
pub use format::PatternExportFormat;

pub fn export_pattern<P: AsRef<std::path::Path>>(
  patproj: &PatternProject,
  file_path: P,
  options: serde_json::Value,
  symbol_fonts_dir: std::path::PathBuf,
) -> Result<()> {
  match PatternExportFormat::try_from(file_path.as_ref().extension())? {
    PatternExportFormat::Pdf => {
      let options: PdfExportOptions = serde_json::from_value(options).map_err(Error::InvalidPdfExportOptions)?;
      pdf::export_pattern(patproj, file_path, options, symbol_fonts_dir)
    }
  }
  .map_err(Error::FailedToExport)
}
