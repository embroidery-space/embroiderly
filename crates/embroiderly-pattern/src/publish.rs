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
  /// Whether to center the frames on the page.
  pub center_frames: bool,
  /// Whether to enumerate the frames.
  pub enumerate_frames: bool,
  /// Options for rendering the frames.
  pub frame_options: ImageExportOptions,
}

impl Default for PdfExportOptions {
  fn default() -> Self {
    Self {
      center_frames: false,
      enumerate_frames: true,
      frame_options: ImageExportOptions {
        frame_size: Some((30, 40)),
        preserved_overlap: Some(ImageExportOptions::DEFAULT_PRESERVED_OVERLAP),
        show_grid_line_numbers: true,
        show_centering_marks: true,
      },
    }
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct ImageExportOptions {
  /// Maximum size of a frame in stitches (width, height).
  /// If None, the entire pattern is rendered as a single image.
  pub frame_size: Option<(u16, u16)>,
  /// Number of overlapping rows/columns from adjacent frames to include.
  /// Defaults to 3 if not specified and framing is active.
  pub preserved_overlap: Option<u16>,
  /// Whether to show grid line numbers in the exported image.
  pub show_grid_line_numbers: bool,
  /// Whether to show centering marks in the exported image.
  pub show_centering_marks: bool,
}

impl ImageExportOptions {
  pub const DEFAULT_PRESERVED_OVERLAP: u16 = 3;
}

impl Default for ImageExportOptions {
  fn default() -> Self {
    Self {
      frame_size: None,
      preserved_overlap: Some(Self::DEFAULT_PRESERVED_OVERLAP),
      show_grid_line_numbers: false,
      show_centering_marks: false,
    }
  }
}
