use wasm_bindgen::convert::TryFromJsValue as _;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(module = "~/lib/errors.ts")]
extern "C" {
  #[wasm_bindgen(js_name = toApplicationError)]
  fn to_application_error(raw_error: &JsValue) -> JsValue;
}

#[derive(Debug, Clone, serde::Serialize)]
#[non_exhaustive]
pub enum ErrorKind {
  // Pattern errors.
  PatternNotFound,
  UnsupportedPatternType,
  FailedToParse,
  UnsavedChanges,

  // Palette errors.
  UnknownPaletteGroup(String),
  UnsupportedPaletteType(String),

  // Layer errors.
  CannotRemoveLastLayer,

  // File handle errors.
  NoFileHandle,

  // Catch-all for unexpected errors.
  Unexpected,
}

impl ErrorKind {
  fn message(&self) -> String {
    match self {
      Self::PatternNotFound => String::from("Pattern not found."),
      Self::UnsupportedPatternType => String::from("Unsupported pattern type."),
      Self::FailedToParse => String::from("Failed to parse pattern."),
      Self::UnsavedChanges => String::from("Pattern has unsaved changes."),

      Self::UnknownPaletteGroup(group) => format!("Unknown palette group: {group}."),
      Self::UnsupportedPaletteType(extension) => format!("Unsupported palette type: {extension}."),

      Self::CannotRemoveLastLayer => String::from("Cannot remove the last layer."),

      Self::NoFileHandle => String::from("Pattern has no associated file handle."),

      Self::Unexpected => String::from("An unexpected error occurred."),
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
  pub const fn new(kind: ErrorKind) -> Self {
    Self { kind, source: None }
  }

  pub fn with_source(mut self, src: impl Into<anyhow::Error>) -> Self {
    debug_assert!(self.source.is_none(), "the source of the error has already been set");
    self.source = Some(src.into());
    self
  }
}

impl std::fmt::Display for Error {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.kind)?;
    if let Some(source) = &self.source {
      write!(f, " Source: {source}")?;
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
    state.serialize_field("message", &self.to_string())?;
    state.end()
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

impl From<serde_json::Error> for Error {
  fn from(err: serde_json::Error) -> Self {
    Self::new(ErrorKind::Unexpected).with_source(err)
  }
}

impl From<embroiderly_parsers::Error> for Error {
  fn from(err: embroiderly_parsers::Error) -> Self {
    match err {
      embroiderly_parsers::Error::UnsupportedPatternType(_) => Self::new(ErrorKind::UnsupportedPatternType),
      embroiderly_parsers::Error::UnsupportedPaletteType(ext) => Self::new(ErrorKind::UnsupportedPaletteType(ext)),
      embroiderly_parsers::Error::FailedToParse(e) => Self::new(ErrorKind::FailedToParse).with_source(e),
    }
  }
}

impl From<embroiderly_web::Error> for Error {
  fn from(err: embroiderly_web::Error) -> Self {
    Self::new(ErrorKind::Unexpected).with_source(err)
  }
}

impl From<embroiderly_editor::Error> for Error {
  fn from(err: embroiderly_editor::Error) -> Self {
    match err {
      embroiderly_editor::Error::PatternNotFound(_) => Self::new(ErrorKind::PatternNotFound),
      embroiderly_editor::Error::CannotRemoveLastLayer => Self::new(ErrorKind::CannotRemoveLastLayer),
      embroiderly_editor::Error::ActionNotPerformed | embroiderly_editor::Error::StitchNotFound => {
        Self::new(ErrorKind::Unexpected).with_source(err)
      }
    }
  }
}

impl From<JsValue> for Error {
  fn from(err: JsValue) -> Self {
    let err_msg = if let Some(js_err) = js_sys::Error::try_from_js_value_ref(&err) {
      format!("{}: {}", String::from(js_err.name()), String::from(js_err.message()))
    } else if let Some(msg) = err.as_string() {
      msg
    } else {
      format!("{err:?}")
    };
    Self::new(ErrorKind::Unexpected).with_source(anyhow::anyhow!(err_msg))
  }
}

impl From<Error> for JsValue {
  fn from(err: Error) -> Self {
    let raw_err = serde_wasm_bindgen::to_value(&err).unwrap_or_else(|_| Self::from_str(&err.to_string()));
    to_application_error(&raw_err)
  }
}
