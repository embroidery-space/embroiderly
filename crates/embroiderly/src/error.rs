pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error(transparent)]
  Command(#[from] CommandError),

  #[error(transparent)]
  Pattern(#[from] PatternError),

  #[error(transparent)]
  Tauri(#[from] tauri::Error),

  #[error(transparent)]
  Io(#[from] std::io::Error),

  #[error(transparent)]
  Uuid(#[from] uuid::Error),

  #[error(transparent)]
  Unknown(#[from] anyhow::Error),
}

#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
pub enum ErrorKind {
  Command(String),
  Pattern(String),
  Tauri(String),
  Io(String),
  Uuid(String),
  Unknown(String),
}

impl serde::Serialize for Error {
  fn serialize<S: serde::ser::Serializer>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error> {
    let error_message = self.to_string();
    let error_kind = match self {
      Self::Command(_) => ErrorKind::Command(error_message),
      Self::Pattern(_) => ErrorKind::Pattern(error_message),
      Self::Tauri(_) => ErrorKind::Tauri(error_message),
      Self::Io(_) => ErrorKind::Io(error_message),
      Self::Uuid(_) => ErrorKind::Uuid(error_message),
      Self::Unknown(_) => ErrorKind::Unknown(error_message),
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
}

#[derive(Debug, thiserror::Error)]
pub enum PatternError {
  #[error("Err01: Pattern({0}) not found.")]
  PatternNotFound(uuid::Uuid),

  #[error("Err02: Backup file for pattern exists.")]
  BackupFileExists,

  #[error("Err03: Unsupported pattern type: {0}")]
  UnsupportedPatternType(String),

  #[error("Err04: The {0} pattern type is not supported for saving.")]
  UnsupportedPatternTypeForSaving(String),

  #[error("Err05: Failed to parse pattern: {0}")]
  FailedToParse(#[source] anyhow::Error),

  #[error("Err06: Pattern({0}) has unsaved changes.")]
  UnsavedChanges(uuid::Uuid),

  #[error("Err07: Unsupported pattern export type: {0}")]
  UnsupportedPatternExportType(String),

  #[error("Err08: Failed to export pattern: {0}")]
  FailedToExport(#[source] anyhow::Error),
}
