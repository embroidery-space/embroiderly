#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct DisplaySettings {
  pub grid: Grid,
  pub display_mode: DisplayMode,
  pub show_symbols: bool,
  pub show_grid: bool,
  pub show_rulers: bool,
}

impl Default for DisplaySettings {
  fn default() -> Self {
    Self {
      grid: Grid::default(),
      display_mode: DisplayMode::Solid,
      show_symbols: false,
      show_grid: true,
      show_rulers: true,
    }
  }
}

#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct Grid {
  pub major_lines_interval: u16,
  pub minor_lines: GridLine,
  pub major_lines: GridLine,
}

impl Default for Grid {
  fn default() -> Self {
    Self {
      major_lines_interval: 10,
      minor_lines: GridLine {
        color: String::from("C8C8C8"),
        thickness: 1.0,
        pixel_line: false,
      },
      major_lines: GridLine {
        color: String::from("646464"),
        thickness: 1.0,
        pixel_line: false,
      },
    }
  }
}

#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct GridLine {
  pub color: String,

  /// This is a value relative to 1px:
  /// - `thickness=0.5` means `0.5px` (or `0,036pt`),
  /// - `thickness=1` means `1px` (or `0,072pt`), and
  /// - `thickness=2` means `2px` (or `0,144pt`).
  ///
  /// When pattern is being exported to PDF, the thickness is calculated as `thickness * (<default cell size> / <user cell size>)`, where `<default cell size>` is `14px`.
  /// This ensures a proper scaling of grid lines during the export.
  pub thickness: f32,

  /// If set to `true`, the line will always be rendered wtih 1px thickness regardles of the `thickness` value or the canvas scale.
  pub pixel_line: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum DisplayMode {
  Solid,
  Stitches,
  Mixed,
}

impl std::fmt::Display for DisplayMode {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    match self {
      Self::Solid => write!(f, "Solid"),
      Self::Stitches => write!(f, "Stitches"),
      Self::Mixed => write!(f, "Mixed"),
    }
  }
}

impl std::str::FromStr for DisplayMode {
  type Err = &'static str;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    match s {
      "Solid" => Ok(Self::Solid),
      "Stitches" => Ok(Self::Stitches),
      "Mixed" => Ok(Self::Mixed),
      _ => Ok(Self::Mixed),
    }
  }
}
