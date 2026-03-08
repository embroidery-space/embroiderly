use xsp_parsers::pmaker;

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
  pub layers_visibility: LayersVisibility,
}

impl Default for DisplaySettings {
  fn default() -> Self {
    Self {
      grid: Grid::default(),
      display_mode: DisplayMode::Solid,
      show_symbols: false,
      show_grid: true,
      show_rulers: true,
      layers_visibility: LayersVisibility::default(),
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
        thickness: 0.072,
      },
      major_lines: GridLine {
        color: String::from("646464"),
        thickness: 0.072,
      },
    }
  }
}

impl From<pmaker::Grid> for Grid {
  fn from(grid: pmaker::Grid) -> Self {
    Self {
      major_lines_interval: grid.major_lines_interval,
      minor_lines: grid.minor_screen_lines.into(),
      major_lines: grid.major_screen_lines.into(),
    }
  }
}

#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct GridLine {
  pub color: String,

  /// Counts in points.
  pub thickness: f32,
}

impl From<pmaker::GridLineStyle> for GridLine {
  fn from(line: pmaker::GridLineStyle) -> Self {
    Self {
      color: line.color,
      thickness: line.thickness,
    }
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum DisplayMode {
  Solid,
  Stitches,
  Mixed,
}

impl DisplayMode {
  #[must_use]
  pub const fn from_pattern_maker(value: u16) -> Self {
    match value {
      0 => Self::Stitches,
      2 => Self::Solid,
      _ => Self::Mixed,
    }
  }
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

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct LayersVisibility {
  pub reference_image: bool,

  pub fullstitches: bool,
  pub petitestitches: bool,

  pub halfstitches: bool,
  pub quarterstitches: bool,

  pub backstitches: bool,
  pub straightstitches: bool,

  pub frenchknots: bool,
  pub beads: bool,

  pub specialstitches: bool,
}

impl Default for LayersVisibility {
  fn default() -> Self {
    Self {
      reference_image: true,

      fullstitches: true,
      petitestitches: true,

      halfstitches: true,
      quarterstitches: true,

      backstitches: true,
      straightstitches: true,

      frenchknots: true,
      beads: true,

      specialstitches: true,
    }
  }
}
