use borsh::{BorshDeserialize, BorshSerialize};

use super::DefaultStitchStrands;

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct DisplaySettings {
  pub default_stitch_font: String,
  pub symbols: Vec<Symbols>,
  pub symbol_settings: SymbolSettings,
  pub formats: Vec<Formats>,
  pub grid: Grid,
  pub display_mode: DisplayMode,
  pub zoom: u16,
  pub show_grid: bool,
  pub show_rulers: bool,
  pub show_centering_marks: bool,
  pub show_fabric_colors_with_symbols: bool,
  pub gaps_between_stitches: bool,
  pub outlined_stitches: bool,
  pub stitch_outline: StitchOutline,
  pub stitch_settings: StitchSettings,
}

impl Default for DisplaySettings {
  fn default() -> Self {
    Self {
      default_stitch_font: String::from("CrossStitch3"),
      symbols: Vec::new(),
      symbol_settings: SymbolSettings::default(),
      formats: Vec::new(),
      grid: Grid::default(),
      display_mode: DisplayMode::Solid,
      zoom: 100,
      show_grid: true,
      show_rulers: true,
      show_centering_marks: true,
      show_fabric_colors_with_symbols: false,
      gaps_between_stitches: false,
      outlined_stitches: true,
      stitch_outline: StitchOutline::default(),
      stitch_settings: StitchSettings::default(),
    }
  }
}

impl DisplaySettings {
  pub fn new(palette_size: usize) -> Self {
    Self {
      symbols: vec![Symbols::default(); palette_size],
      formats: vec![Formats::default(); palette_size],
      ..DisplaySettings::default()
    }
  }
}

#[derive(Debug, Default, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct Symbols {
  pub full: Option<u16>,
  pub petite: Option<u16>,
  pub half: Option<u16>,
  pub quarter: Option<u16>,
  pub french_knot: Option<u16>,
  pub bead: Option<u16>,
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct SymbolSettings {
  pub screen_spacing: (u16, u16),
  pub printer_spacing: (u16, u16),
  pub scale_using_maximum_font_width: bool,
  pub scale_using_font_height: bool,
  pub stitch_size: Percentage,
  pub small_stitch_size: Percentage,
  pub draw_symbols_over_backstitches: bool,
  pub show_stitch_color: bool,
  pub use_large_half_stitch_symbol: bool,
  pub use_triangles_behind_quarter_stitches: bool,
}

impl Default for SymbolSettings {
  fn default() -> Self {
    Self {
      screen_spacing: (1, 1),
      printer_spacing: (1, 1),
      scale_using_maximum_font_width: true,
      scale_using_font_height: true,
      stitch_size: Percentage::new(100),
      small_stitch_size: Percentage::new(60),
      draw_symbols_over_backstitches: false,
      show_stitch_color: false,
      use_large_half_stitch_symbol: false,
      use_triangles_behind_quarter_stitches: false,
    }
  }
}

#[derive(Debug, Default, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct Formats {
  pub symbol: SymbolFormat,
  pub back: LineFormat,
  pub straight: LineFormat,
  pub french: NodeFormat,
  pub bead: NodeFormat,
  pub special: LineFormat,
  pub font: FontFormat,
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct SymbolFormat {
  pub use_alt_bg_color: bool,
  pub bg_color: String,
  pub fg_color: String,
}

impl Default for SymbolFormat {
  fn default() -> Self {
    Self {
      use_alt_bg_color: false,
      bg_color: String::from("FFFFFF"),
      fg_color: String::from("000000"),
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct LineFormat {
  pub use_alt_color: bool,
  pub color: String,
  pub style: LineStyle,
  pub thickness: StitchThickness,
}

impl Default for LineFormat {
  fn default() -> Self {
    Self {
      use_alt_color: false,
      color: String::from("000000"),
      style: LineStyle::Solid,
      thickness: StitchThickness::new(1.0),
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
#[borsh(use_discriminant = true)]
pub enum LineStyle {
  Solid = 0,
  Barred = 1,
  Dotted = 2,
  ChainDotted = 3,
  Dashed = 4,
  Outlined = 5,
  Zebra = 6,
  ZigZag = 7,
  Morse = 8,
}

impl From<u16> for LineStyle {
  fn from(value: u16) -> Self {
    match value {
      // These are the values used by Pattern Maker.
      0 | 5 => LineStyle::Solid,
      1 | 7 => LineStyle::Barred,
      2 | 6 => LineStyle::Dotted,
      11 => LineStyle::ChainDotted,
      3 | 8 => LineStyle::Dashed,
      9 => LineStyle::Outlined,
      10 => LineStyle::Zebra,
      12 => LineStyle::ZigZag,
      4 => LineStyle::Morse,
      _ => panic!("Invalid LineStyle value: {value}"),
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct NodeFormat {
  pub use_dot_style: bool,
  pub use_alt_color: bool,
  pub color: String,
  pub thickness: StitchThickness, // actually, diameter.
}

impl Default for NodeFormat {
  fn default() -> Self {
    Self {
      use_dot_style: true,
      use_alt_color: false,
      color: String::from("000000"),
      thickness: StitchThickness::new(1.0),
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct FontFormat {
  pub font_name: Option<String>,
  pub bold: bool,
  pub italic: bool,
  pub stitch_size: Percentage,
  pub small_stitch_size: Percentage,
}

impl Default for FontFormat {
  fn default() -> Self {
    Self {
      font_name: None,
      bold: false,
      italic: false,
      stitch_size: Percentage::new(100),
      small_stitch_size: Percentage::new(60),
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct Grid {
  pub major_lines_interval: u16,
  pub minor_screen_lines: GridLineStyle,
  pub major_screen_lines: GridLineStyle,
  pub minor_printer_lines: GridLineStyle,
  pub major_printer_lines: GridLineStyle,
}

impl Default for Grid {
  fn default() -> Self {
    Self {
      major_lines_interval: 10,
      minor_screen_lines: GridLineStyle {
        color: String::from("C8C8C8"),
        thickness: 0.072,
      },
      major_screen_lines: GridLineStyle {
        color: String::from("646464"),
        thickness: 0.072,
      },
      minor_printer_lines: GridLineStyle {
        color: String::from("000000"),
        thickness: 0.144,
      },
      major_printer_lines: GridLineStyle {
        color: String::from("000000"),
        thickness: 0.504,
      },
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct GridLineStyle {
  pub color: String,

  /// Counts in points.
  pub thickness: f32,
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
#[borsh(use_discriminant = true)]
pub enum DisplayMode {
  Solid = 0,
  Stitches = 1,
}

impl DisplayMode {
  pub fn from_pattern_maker(value: u16) -> Self {
    match value {
      0 => DisplayMode::Stitches,
      _ => DisplayMode::Solid,
    }
  }
}

impl std::fmt::Display for DisplayMode {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    match self {
      DisplayMode::Solid => write!(f, "Solid"),
      DisplayMode::Stitches => write!(f, "Stitches"),
    }
  }
}

impl std::str::FromStr for DisplayMode {
  type Err = &'static str;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    match s {
      "Solid" => Ok(DisplayMode::Solid),
      "Stitches" => Ok(DisplayMode::Stitches),
      _ => Ok(DisplayMode::Solid),
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct StitchOutline {
  pub color: Option<String>,
  pub color_percentage: Percentage,
  pub thickness: StitchOutlineThickness,
}

impl Default for StitchOutline {
  fn default() -> Self {
    Self {
      color: None,
      color_percentage: Percentage::new(80),
      thickness: StitchOutlineThickness::new(0.2),
    }
  }
}

#[nutype::nutype(
  sanitize(with = |raw| raw.clamp(0.1, 1.0)),
  derive(Debug, Clone, Copy, PartialEq, BorshSerialize, BorshDeserialize)
)]
pub struct StitchOutlineThickness(f32);

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct StitchSettings {
  pub default_strands: DefaultStitchStrands,
  /// 1..=12 - strands, 13 - french knot.
  pub display_thickness: [StitchThickness; 13],
}

impl Default for StitchSettings {
  fn default() -> Self {
    Self {
      default_strands: DefaultStitchStrands::default(),
      display_thickness: [
        StitchThickness::new(1.0), // 1 strand
        StitchThickness::new(1.5), // 2 strands
        StitchThickness::new(2.5), // 3 strands
        StitchThickness::new(3.0), // 4 strands
        StitchThickness::new(3.5), // 5 strands
        StitchThickness::new(4.0), // 6 strands
        StitchThickness::new(4.5), // 7 strands
        StitchThickness::new(5.0), // 8 strands
        StitchThickness::new(5.5), // 9 strands
        StitchThickness::new(6.0), // 10 strands
        StitchThickness::new(6.5), // 11 strands
        StitchThickness::new(7.0), // 12 strands
        StitchThickness::new(4.0), // French knot
      ],
    }
  }
}

#[nutype::nutype(
  sanitize(with = |raw| raw.clamp(0.1, 10.0)),
  derive(Debug, Clone, Copy, PartialEq, BorshSerialize, BorshDeserialize)
)]
pub struct StitchThickness(f32);

#[nutype::nutype(
  sanitize(with = |raw| raw.clamp(1, 100)),
  derive(Debug, Clone, Copy, PartialEq, BorshSerialize, BorshDeserialize)
)]
pub struct Percentage(u8);
