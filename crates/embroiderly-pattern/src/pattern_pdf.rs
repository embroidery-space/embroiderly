#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct PatternPdf {
  pub template: String,
  pub files: Vec<PdfAsset>,
  pub fonts: Vec<PdfAsset>,
}

impl Default for PatternPdf {
  fn default() -> Self {
    Self {
      template: String::from(include_str!(
        "../../../packages/pdf-export/src-wasm/src/typst/pattern.typ"
      )),
      files: Vec::new(),
      fonts: Vec::new(),
    }
  }
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct PdfAsset {
  pub file_name: String,
  pub content: Vec<u8>,
}
