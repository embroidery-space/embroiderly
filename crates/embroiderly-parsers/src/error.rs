pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error("Unsupported pattern type: {0}")]
  UnsupportedPatternType(String),

  #[error("Unsupported palette type: {0}")]
  UnsupportedPaletteType(String),

  #[error("Failed to parse: {0}")]
  FailedToParse(#[source] anyhow::Error),
}
