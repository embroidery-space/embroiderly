#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct PatternPdf {
  /// The Typst template.
  pub template: String,
  /// Whether the document is black-and-white (monochrome) or color.
  pub color: bool,
}

impl Default for PatternPdf {
  fn default() -> Self {
    Self {
      template: String::from(include_str!("pattern_pdf.typ")),
      color: true,
    }
  }
}
