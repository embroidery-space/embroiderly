#[derive(Debug, PartialEq)]
pub struct Pattern {
  pub info: PatternInfo,
  pub fabric: Fabric,
  pub palette: Vec<PaletteItem>,
  pub formats: Vec<Formats>,
  pub symbols: Vec<Symbols>,
  pub fullstitches: Vec<FullStitch>,
  pub partstitches: Vec<PartStitch>,
  pub linestitches: Vec<LineStitch>,
  pub nodestitches: Vec<NodeStitch>,
  pub specialstitches: Vec<SpecialStitch>,
  pub special_stitch_models: Vec<SpecialStitchModel>,
  pub grid: Grid,
  pub pattern_settings: PatternSettings,
  pub stitch_settings: StitchSettings,
  pub symbol_settings: SymbolSettings,
  pub print_settings: PrintSettings,
}

#[derive(Debug, PartialEq)]
pub struct PatternInfo {
  pub title: String,
  pub author: String,
  pub company: String,
  pub copyright: String,
  pub description: String,
}

#[derive(Debug, PartialEq)]
pub struct Fabric {
  pub width: u16,
  pub height: u16,
  pub stitches_per_inch: (u8, u8),
  pub kind: String,
  pub name: String,
  pub color: String,
}

#[derive(Debug, PartialEq)]
pub struct PaletteItem {
  pub brand: String,
  pub number: String,
  pub name: String,
  pub color: String,
  pub blends: Option<Vec<Blend>>,
  pub bead: Option<Bead>,
  pub strands: Option<StitchStrands<Option<u8>>>,
}

#[derive(Debug, PartialEq, Default)]
pub struct StitchStrands<T> {
  pub full: T,
  pub petite: T,
  pub half: T,
  pub quarter: T,
  pub back: T,
  pub straight: T,
  pub french_knot: T,
  pub special: T,
}

#[derive(Debug, PartialEq)]
pub struct Blend {
  pub brand: String,
  pub number: String,
  pub strands: u8,
}

#[derive(Debug, PartialEq)]
pub struct Bead {
  pub length: f32,
  pub diameter: f32,
}

#[derive(Debug, PartialEq)]
pub struct Formats {
  pub symbol: SymbolFormat,
  pub back_stitch: LineStitchFormat,
  pub straight_stitch: LineStitchFormat,
  pub french_knot: NodeStitchFormat,
  pub bead: NodeStitchFormat,
  pub special_stitch: LineStitchFormat,
  pub font: FontFormat,
}

#[derive(Debug, PartialEq)]
pub struct SymbolFormat {
  pub use_alt_bg_color: bool,
  pub bg_color: String,
  pub fg_color: String,
}

#[derive(Debug, PartialEq)]
pub struct LineStitchFormat {
  pub use_alt_color: bool,
  pub color: String,
  pub style: u16,
  pub thickness: f32,
}

#[derive(Debug, PartialEq)]
pub struct NodeStitchFormat {
  pub use_dot_style: bool,
  pub use_alt_color: bool,
  pub color: String,
  pub thickness: f32,
}

#[derive(Debug, PartialEq)]
pub struct FontFormat {
  pub font_name: Option<String>,
  pub bold: bool,
  pub italic: bool,
  pub stitch_size: u8,
  pub small_stitch_size: u8,
}

#[derive(Debug, PartialEq)]
pub struct Symbols {
  pub full: Option<u16>,
  pub petite: Option<u16>,
  pub half: Option<u16>,
  pub quarter: Option<u16>,
  pub french_knot: Option<u16>,
  pub bead: Option<u16>,
}

#[derive(Debug, PartialEq)]
pub struct FullStitch {
  pub x: f32,
  pub y: f32,
  pub palindex: u8,
  pub kind: FullStitchKind,
}

#[derive(Debug, PartialEq)]
pub enum FullStitchKind {
  Full,
  Petite,
}

#[derive(Debug, PartialEq)]
pub struct PartStitch {
  pub x: f32,
  pub y: f32,
  pub palindex: u8,
  pub direction: PartStitchDirection,
  pub kind: PartStitchKind,
}

#[derive(Debug, PartialEq)]
pub enum PartStitchDirection {
  Forward,
  Backward,
}

#[derive(Debug, PartialEq)]
pub enum PartStitchKind {
  Half,
  Quarter,
}

#[derive(Debug, PartialEq)]
pub struct LineStitch {
  pub x: (f32, f32),
  pub y: (f32, f32),
  pub palindex: u8,
  pub kind: LineStitchKind,
}

#[derive(Debug, PartialEq)]
pub enum LineStitchKind {
  Back,
  Straight,
}

#[derive(Debug, PartialEq)]
pub struct NodeStitch {
  pub x: f32,
  pub y: f32,
  pub rotated: bool,
  pub palindex: u8,
  pub kind: NodeStitchKind,
}

#[derive(Debug, PartialEq)]
pub enum NodeStitchKind {
  FrenchKnot,
  Bead,
}

#[derive(Debug, PartialEq)]
pub struct SpecialStitch {
  pub x: f32,
  pub y: f32,
  pub rotation: u16,
  pub flip: (bool, bool),
  pub palindex: u8,
  pub modindex: u8,
}

#[derive(Debug, Default, PartialEq)]
pub struct SpecialStitchModel {
  pub unique_name: String,
  pub name: String,
  pub width: f32,
  pub height: f32,
  pub linestitches: Vec<LineStitch>,
  pub nodestitches: Vec<NodeStitch>,
  pub curvedstitches: Vec<CurvedStitch>,
}

#[derive(Debug, PartialEq)]
pub struct CurvedStitch {
  pub points: Vec<(f32, f32)>,
}

#[derive(Debug, PartialEq)]
pub struct Grid {
  pub major_lines_interval: u16,
  pub minor_screen_lines: GridLineStyle,
  pub major_screen_lines: GridLineStyle,
  pub minor_printer_lines: GridLineStyle,
  pub major_printer_lines: GridLineStyle,
}

#[derive(Debug, PartialEq)]
pub struct GridLineStyle {
  pub color: String,
  pub thickness: f32,
}

#[derive(Debug, PartialEq)]
pub struct PatternSettings {
  pub default_stitch_font: String,
  pub view: u16,
  pub zoom: u16,
  pub show_grid: bool,
  pub show_rulers: bool,
  pub show_centering_marks: bool,
  pub show_fabric_colors_with_symbols: bool,
  pub gaps_between_stitches: bool,
}

#[derive(Debug, PartialEq)]
pub struct StitchSettings {
  pub default_strands: StitchStrands<u8>,
  pub display_thickness: [f32; 13], // 1..=12 - strands, 13 - french knot.
  pub outlined_stitches: bool,
  pub stitch_outline: StitchOutline,
}

#[derive(Debug, PartialEq)]
pub struct StitchOutline {
  pub color: Option<String>,
  pub color_percentage: u8,
  pub thickness: f32,
}

#[derive(Debug, PartialEq)]
pub struct SymbolSettings {
  pub screen_spacing: (u16, u16),
  pub printer_spacing: (u16, u16),
  pub scale_using_maximum_font_width: bool,
  pub scale_using_font_height: bool,
  pub stitch_size: u8,
  pub small_stitch_size: u8,
  pub draw_symbols_over_backstitches: bool,
  pub show_stitch_color: bool,
  pub use_large_half_stitch_symbol: bool,
  pub use_triangles_behind_quarter_stitches: bool,
}

#[derive(Debug, PartialEq)]
pub struct PrintSettings {
  pub font: Font,
  pub header: String,
  pub footer: String,
  pub margins: PageMargins,
  pub show_page_numbers: bool,
  pub show_adjacent_page_numbers: bool,
  pub center_chart_on_pages: bool,
}

#[derive(Debug, PartialEq)]
pub struct Font {
  pub name: String,
  pub size: u16,
  pub weight: u16,
  pub italic: bool,
}

#[derive(Debug, PartialEq)]
pub struct PageMargins {
  pub left: f32,
  pub right: f32,
  pub top: f32,
  pub bottom: f32,
  pub header: f32,
  pub footer: f32,
}
