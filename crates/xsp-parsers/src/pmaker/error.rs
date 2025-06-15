#[derive(Debug, thiserror::Error)]
pub enum PmakerError {
  #[error("The signature of Pattern Maker v4 is incorrect! Expected: {expected:#06X}, found: {found:#06X}")]
  InvalidSignature { expected: u16, found: u16 },

  #[error("Invalid palette type: {0}")]
  InvalidPaletteType(String),

  #[error(transparent)]
  Io(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, PmakerError>;
