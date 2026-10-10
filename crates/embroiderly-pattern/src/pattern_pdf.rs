static DEFAULT_PATTERN_TEMPLATE: &str = include_str!("pattern_pdf.typ");

#[derive(Debug, Clone)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct PatternPdf {
  pub template: String,
}

impl Default for PatternPdf {
  fn default() -> Self {
    Self {
      template: DEFAULT_PATTERN_TEMPLATE.to_owned(),
    }
  }
}
