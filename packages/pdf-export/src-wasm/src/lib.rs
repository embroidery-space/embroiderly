#![allow(clippy::future_not_send)]

use wasm_bindgen::prelude::*;

mod pdf;

#[wasm_bindgen]
pub enum PdfVariant {
  Monochrome,
  Color,
}

#[wasm_bindgen]
pub async fn export_pdf(
  file_handle: web_sys::FileSystemFileHandle,
  pattern: &[u8],
  options: &[u8],
  variant: PdfVariant,
  font_data: Vec<js_sys::Uint8Array>,
) -> Result<(), JsError> {
  let embproj = borsh::from_slice(pattern).map_err(|e| JsError::new(&e.to_string()))?;
  let options = borsh::from_slice(options).map_err(|e| JsError::new(&e.to_string()))?;

  let font_data: Vec<Vec<u8>> = font_data.iter().map(js_sys::Uint8Array::to_vec).collect();

  let pdf_bytes =
    pdf::export_pattern(embproj, options, variant, font_data).map_err(|e| JsError::new(&e.to_string()))?;
  embroiderly_web::opfs::FileHandle::from(file_handle)
    .write(&pdf_bytes)
    .await
    .map_err(|e| JsError::new(&e.to_string()))?;

  Ok(())
}
