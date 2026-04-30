use wasm_bindgen::prelude::*;

mod pdf;

#[wasm_bindgen]
pub enum PdfVariant {
  Monochrome,
  Color,
}

#[wasm_bindgen]
pub fn export_pdf(
  pattern: &[u8],
  options: &[u8],
  variant: PdfVariant,
  font_data: Vec<js_sys::Uint8Array>,
) -> Result<Vec<u8>, JsError> {
  let patproj = borsh::from_slice(pattern).map_err(|e| JsError::new(&e.to_string()))?;
  let options = borsh::from_slice(options).map_err(|e| JsError::new(&e.to_string()))?;
  let font_data: Vec<Vec<u8>> = font_data.iter().map(js_sys::Uint8Array::to_vec).collect();
  pdf::export_pattern(patproj, options, variant, font_data).map_err(|e| JsError::new(&e.to_string()))
}
