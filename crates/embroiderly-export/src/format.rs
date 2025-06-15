use std::ffi::OsStr;

use crate::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PatternExportFormat {
  Pdf,
}

impl TryFrom<Option<&OsStr>> for PatternExportFormat {
  type Error = Error;

  fn try_from(value: Option<&OsStr>) -> std::result::Result<Self, Self::Error> {
    if let Some(extension) = value {
      let extension = extension.to_str().unwrap();
      match extension.to_lowercase().as_str() {
        "pdf" => Ok(Self::Pdf),
        _ => Err(Error::UnsupportedExportType(extension.to_string())),
      }
    } else {
      Err(Error::UnsupportedExportType("No extension".into()))
    }
  }
}

impl std::fmt::Display for PatternExportFormat {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Pdf => write!(f, "pdf"),
    }
  }
}
