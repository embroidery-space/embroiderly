#![allow(clippy::future_not_send)]

use wasm_bindgen::prelude::*;

mod export;

#[wasm_bindgen]
pub struct PdfExportWorker {
  /// The target pattern for export.
  embproj: embroiderly_pattern::EmbroiderlyProject,
  /// An array of fonts (both text and symbol) used in the document.
  font_data: Vec<Vec<u8>>,
}

#[wasm_bindgen]
impl PdfExportWorker {
  #[wasm_bindgen(constructor)]
  pub fn new(embproj: &[u8], font_data: Vec<js_sys::Uint8Array>) -> Result<Self, JsError> {
    Ok(Self {
      embproj: borsh::from_slice(embproj).map_err(|e| JsError::new(&e.to_string()))?,
      font_data: font_data.iter().map(js_sys::Uint8Array::to_vec).collect(),
    })
  }

  #[wasm_bindgen]
  pub fn export(&self, pattern_pdf: &[u8]) -> Result<Vec<u8>, JsError> {
    export::export_pattern(
      &self.embproj,
      &self.font_data,
      borsh::from_slice(pattern_pdf).map_err(|e| JsError::new(&e.to_string()))?,
    )
    .map_err(|e| JsError::new(&e.to_string()))
  }
}
