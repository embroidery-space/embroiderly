pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error("Failed to export pattern: {0}")]
  FailedToExport(#[source] anyhow::Error),

  #[error("Invalid palette file: {0}")]
  InvalidPaletteFile(#[source] serde_json::Error),

  #[error("Invalid image import options: {0}")]
  InvalidImageImportOptions(#[source] serde_json::Error),
}
