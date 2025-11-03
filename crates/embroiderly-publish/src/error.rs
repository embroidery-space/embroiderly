pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error("Failed to export pattern: {0}")]
  FailedToExport(#[source] anyhow::Error),

  #[error("Invalid PDF export options: {0}")]
  InvalidPdfExportOptions(#[source] serde_json::Error),

  #[error("Unsupported export type: {0}")]
  UnsupportedExportType(String),
}
