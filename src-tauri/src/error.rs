pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error(transparent)]
  Command(#[from] CommandError),

  #[error(transparent)]
  Parsing(#[from] ParsingError),

  #[error(transparent)]
  Tauri(#[from] tauri::Error),

  #[error(transparent)]
  Io(#[from] std::io::Error),

  #[error(transparent)]
  Uuid(#[from] uuid::Error),

  #[error(transparent)]
  Other(#[from] anyhow::Error),
}

#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
pub enum ErrorKind {
  Command(String),
  Parsing(String),
  Tauri(String),
  Io(String),
  Uuid(String),
  Other(String),
}

impl serde::Serialize for Error {
  fn serialize<S: serde::ser::Serializer>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error> {
    let error_message = self.to_string();
    let error_kind = match self {
      Self::Command(_) => ErrorKind::Command(error_message),
      Self::Parsing(_) => ErrorKind::Parsing(error_message),
      Self::Tauri(_) => ErrorKind::Tauri(error_message),
      Self::Io(_) => ErrorKind::Io(error_message),
      Self::Uuid(_) => ErrorKind::Uuid(error_message),
      Self::Other(_) => ErrorKind::Other(error_message),
    };
    error_kind.serialize(serializer)
  }
}

#[derive(Debug, thiserror::Error)]
pub enum CommandError {
  #[error("Err01: Invalid request body. Expected raw request body.")]
  InvalidRequestBody,

  #[error("Err02: Missing patternId header.")]
  MissingPatternIdHeader,

  #[error("Err03: Pattern({0}) not found.")]
  PatternNotFound(uuid::Uuid),

  #[error("Err04: Backup file for pattern exists.")]
  BackupFileExists,
}

#[derive(Debug, thiserror::Error)]
pub enum ParsingError {
  #[error("Err01: Unsupported pattern type: {0}")]
  UnsupportedPatternType(String),

  #[error("Err02: The {0} pattern type is not supported for saving.")]
  UnsupportedPatternTypeForSaving(String),
}
