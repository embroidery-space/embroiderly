pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Clone, Copy, serde::Serialize)]
#[non_exhaustive]
pub enum ErrorKind {
  // Command errors.
  InvalidRequestBody,
  MissingPatternIdHeader,

  // Pattern errors.
  PatternNotFound,
  BackupFileExists,
  UnsupportedPatternType,
  FailedToParse,
  UnsavedChanges,
  FailedToExport,
  FailedToImport,

  // Layer errors.
  CannotRemoveLastLayer,

  // Catch-all for unexpected errors.
  Unexpected,
}

impl ErrorKind {
  /// Returns a human-readable message for this error kind.
  const fn message(self) -> &'static str {
    match self {
      Self::InvalidRequestBody => "Invalid request body. Expected raw request body.",
      Self::MissingPatternIdHeader => "Missing patternId header.",
      Self::PatternNotFound => "Pattern not found.",
      Self::BackupFileExists => "Backup file for pattern exists.",
      Self::UnsupportedPatternType => "Unsupported pattern type.",
      Self::FailedToParse => "Failed to parse pattern.",
      Self::UnsavedChanges => "Pattern has unsaved changes.",
      Self::FailedToExport => "Failed to export pattern.",
      Self::FailedToImport => "Failed to import image.",
      Self::CannotRemoveLastLayer => "Cannot remove the last layer.",
      Self::Unexpected => "An unexpected error occurred.",
    }
  }
}

impl std::fmt::Display for ErrorKind {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.message())
  }
}

#[derive(Debug)]
pub struct Error {
  kind: ErrorKind,
  source: Option<anyhow::Error>,
}

impl Error {
  /// Creates a new error with a specific kind.
  pub const fn new(kind: ErrorKind) -> Self {
    Self { kind, source: None }
  }

  /// Sets the source of this error.
  pub fn with_source(mut self, src: impl Into<anyhow::Error>) -> Self {
    debug_assert!(self.source.is_none(), "the source of the error has already been set");
    self.source = Some(src.into());
    self
  }

  /// Returns the error's kind.
  pub const fn kind(&self) -> ErrorKind {
    self.kind
  }
}

impl std::fmt::Display for Error {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.kind)?;

    if let Some(source) = &self.source {
      write!(f, " Source: {source}.")?;
    }

    Ok(())
  }
}

impl std::error::Error for Error {
  fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
    self.source.as_ref().map(std::convert::AsRef::as_ref)
  }
}

impl serde::Serialize for Error {
  fn serialize<S: serde::ser::Serializer>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error> {
    use serde::ser::SerializeStruct as _;

    let mut state = serializer.serialize_struct("Error", 2)?;
    state.serialize_field("kind", &self.kind)?;
    state.serialize_field("message", self.kind.message())?;
    state.end()
  }
}

impl From<tauri::Error> for Error {
  fn from(err: tauri::Error) -> Self {
    Self::new(ErrorKind::Unexpected).with_source(err)
  }
}

impl From<image::ImageError> for Error {
  fn from(err: image::ImageError) -> Self {
    Self::new(ErrorKind::Unexpected).with_source(err)
  }
}

impl From<std::io::Error> for Error {
  fn from(err: std::io::Error) -> Self {
    Self::new(ErrorKind::Unexpected).with_source(err)
  }
}

impl From<uuid::Error> for Error {
  fn from(err: uuid::Error) -> Self {
    Self::new(ErrorKind::Unexpected).with_source(err)
  }
}

impl From<anyhow::Error> for Error {
  fn from(err: anyhow::Error) -> Self {
    Self::new(ErrorKind::Unexpected).with_source(err)
  }
}

impl From<embroiderly_parsers::Error> for Error {
  fn from(err: embroiderly_parsers::Error) -> Self {
    match err {
      embroiderly_parsers::Error::UnsupportedPatternType(_) => Self::new(ErrorKind::UnsupportedPatternType),
      embroiderly_parsers::Error::FailedToParse(e) => Self::new(ErrorKind::FailedToParse).with_source(e),
    }
  }
}
