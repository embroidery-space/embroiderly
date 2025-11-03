mod convert;
pub use convert::*;

mod preview;
pub use preview::*;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageImportOptions {
  /// The pattern size in stitches.
  pattern_size: (u16, u16),
  /// The number of colors in the palette.
  palette_size: u16,

  /// Whether to enable dithering.
  #[serde(default)]
  dither: bool,
}
