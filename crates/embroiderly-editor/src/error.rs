#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error("Pattern not found: {0}")]
  PatternNotFound(uuid::Uuid),
  #[error("Action has not been performed yet")]
  ActionNotPerformed,
  #[error("Stitch not found")]
  StitchNotFound,
  #[error("Cannot remove last layer")]
  CannotRemoveLastLayer,
}

pub type Result<T> = std::result::Result<T, Error>;
