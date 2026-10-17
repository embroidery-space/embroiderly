#![allow(clippy::future_not_send)]

use anyhow::Result;
use wasm_bindgen::prelude::*;

mod utils;

#[cfg(test)]
#[path = "lib.test.rs"]
mod tests;

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
    let pattern_pdf = borsh::from_slice(pattern_pdf).map_err(|e| JsError::new(&e.to_string()))?;
    self.export_impl(pattern_pdf).map_err(|e| JsError::new(&e.to_string()))
  }
}

impl PdfExportWorker {
  fn prepare_document(&self, pattern_pdf: embroiderly_pattern::PatternPdf) -> Result<typst_layout::PagedDocument> {
    let typst_template = typst_as_lib::TypstEngine::builder()
      .main_file(
        [
          "#import \"draw.typ\": render-frames",
          "#let pattern = json(\"pattern.json\")",
          &pattern_pdf.template,
        ]
        .join("\n\n"),
      )
      .with_static_source_file_resolver([("draw.typ", include_str!("./typst/draw.typ"))])
      .with_static_file_resolver([("pattern.json", utils::compose_pattern_json(&self.embproj)?)])
      .fonts(self.font_data.iter().map(Vec::as_slice))
      .build();

    let inputs = {
      use typst::foundations::{Dict, IntoValue as _};

      let mut inputs = Dict::new();
      inputs.insert("color".into(), pattern_pdf.color.into_value());

      inputs
    };

    typst_template
      .compile_with_input(inputs)
      .output
      .map_err(|e| anyhow::anyhow!("Failed to compile Typst template: {e}"))
  }

  fn export_impl(&self, pattern_pdf: embroiderly_pattern::PatternPdf) -> Result<Vec<u8>> {
    let doc = self.prepare_document(pattern_pdf)?;
    typst_pdf::pdf(&doc, &typst_pdf::PdfOptions::default())
      .map_err(|warnings| anyhow::anyhow!("Failed to export PDF: {warnings:?}"))
  }
}
