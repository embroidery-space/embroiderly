#![allow(clippy::future_not_send)]

use wasm_bindgen::prelude::*;

mod pdf;

#[derive(Debug, Clone, Copy)]
#[wasm_bindgen]
pub enum PdfVariant {
  Monochrome,
  Color,
}

impl std::fmt::Display for PdfVariant {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Monochrome => write!(f, "monochrome"),
      Self::Color => write!(f, "color"),
    }
  }
}

#[wasm_bindgen]
pub fn export_pdf(
  pattern: &[u8],
  options: &[u8],
  variant: PdfVariant,
  font_data: Vec<js_sys::Uint8Array>,
) -> Result<Vec<u8>, JsError> {
  let embproj = borsh::from_slice(pattern).map_err(|e| JsError::new(&e.to_string()))?;
  let options = borsh::from_slice(options).map_err(|e| JsError::new(&e.to_string()))?;

  let font_data: Vec<Vec<u8>> = font_data.iter().map(js_sys::Uint8Array::to_vec).collect();

  pdf::export_pattern(embproj, options, variant, font_data).map_err(|e| JsError::new(&e.to_string()))
}
