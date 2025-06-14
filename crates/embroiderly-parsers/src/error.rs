pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error("Unsupported pattern type: {0}")]
  UnsupportedPatternType(String),

  #[error("Failed to parse pattern: {0}")]
  FailedToParse(#[source] anyhow::Error),
}
