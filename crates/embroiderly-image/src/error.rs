pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error("Failed to export pattern: {0}")]
  FailedToExport(#[source] anyhow::Error),
}
