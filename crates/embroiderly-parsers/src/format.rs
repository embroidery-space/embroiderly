use crate::error::Error;

#[derive(Default, Clone, Copy, PartialEq, Eq)]
pub enum PatternFormat {
  /// Probably, stands for `Cross-Stitch Design`.
  /// Only **read-only** mode is currently available.
  Xsd,

  /// Stands for `Open Cross-Stitch`.
  /// It is just an XML document.
  /// This format is intended to be a lingua franca in the embroidery world.
  Oxs,

  /// Stands for `Embroidery Project`.
  /// It is a ZIP archive with a pack of XML files.
  /// This format is not recommended for other applications.
  #[default]
  EmbProj,
}

impl TryFrom<&str> for PatternFormat {
  type Error = Error;

  fn try_from(file_name: &str) -> std::result::Result<Self, Self::Error> {
    let extension = file_name.split('.').next_back().unwrap_or_default();
    match extension.to_lowercase().as_str() {
      "xsd" => Ok(Self::Xsd),
      "oxs" | "xml" => Ok(Self::Oxs),
      "embproj" => Ok(Self::EmbProj),
      ext => Err(Error::UnsupportedPatternType(ext.to_string())),
    }
  }
}

impl std::fmt::Display for PatternFormat {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Xsd => write!(f, "xsd"),
      Self::Oxs => write!(f, "oxs"),
      Self::EmbProj => write!(f, "embproj"),
    }
  }
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum PaletteFormat {
  /// Pattern Maker (HobbyWare): `.master` or `.user` files.
  Pmaker,

  /// Win/MacStitch (UrsaSoftware): `.threads` files.
  Ursa,

  /// XSPro Platinum (DP Software): `.rng` files.
  Xspro,

  /// Embroiderly's own JSON palette format.
  Embroiderly,
}

impl TryFrom<&str> for PaletteFormat {
  type Error = Error;

  fn try_from(file_name: &str) -> std::result::Result<Self, Self::Error> {
    let extension = file_name.split('.').next_back().unwrap_or_default();
    match extension.to_lowercase().as_str() {
      "master" | "user" => Ok(Self::Pmaker),
      "threads" => Ok(Self::Ursa),
      "rng" => Ok(Self::Xspro),
      "json" => Ok(Self::Embroiderly),
      ext => Err(Error::UnsupportedPaletteType(ext.to_string())),
    }
  }
}
