#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct PublishSettings {
  pub pdf: PdfExportOptions,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct PdfExportOptions {
  /// Maximum size of a frame in stitches (width, height).
  pub frame_size: (u16, u16),
  /// Number of overlapping rows/columns from adjacent frames to include.
  pub preserved_overlap: u16,
  /// Whether to show grid line numbers in the exported PDF.
  pub show_grid_line_numbers: bool,
  /// Whether to show centering marks in the exported PDF.
  pub show_centering_marks: bool,
}

impl Default for PdfExportOptions {
  fn default() -> Self {
    Self {
      frame_size: (30, 40),
      preserved_overlap: 3,
      show_grid_line_numbers: true,
      show_centering_marks: true,
    }
  }
}
