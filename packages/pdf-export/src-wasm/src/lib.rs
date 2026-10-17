#![allow(clippy::future_not_send)]

use anyhow::Result;
use wasm_bindgen::prelude::*;

mod utils;
mod world;

#[cfg(test)]
#[path = "lib.test.rs"]
mod tests;

#[wasm_bindgen]
pub struct PdfExportWorker {
  /// The target pattern for export.
  embproj: embroiderly_pattern::EmbroiderlyProject,

  /// An array of fonts (both text and symbol) used in the document.
  fonts: Vec<typst::text::Font>,
  /// Pre-built font book metadata.
  font_book: typst::utils::LazyHash<typst::text::FontBook>,
}

#[wasm_bindgen]
impl PdfExportWorker {
  #[wasm_bindgen(constructor)]
  pub fn new(embproj: &[u8], font_data: Vec<js_sys::Uint8Array>) -> Result<Self, JsError> {
    let embproj = borsh::from_slice(embproj).map_err(|e| JsError::new(&e.to_string()))?;
    let font_data = font_data.iter().map(js_sys::Uint8Array::to_vec).collect();
    Ok(Self::init(embproj, font_data))
  }

  #[wasm_bindgen]
  pub fn export(&self, pattern_pdf: &[u8]) -> Result<Vec<u8>, JsError> {
    let pattern_pdf = borsh::from_slice(pattern_pdf).map_err(|e| JsError::new(&e.to_string()))?;
    self.export_impl(pattern_pdf).map_err(|e| JsError::new(&e.to_string()))
  }
}

impl PdfExportWorker {
  #[must_use]
  pub fn init(embproj: embroiderly_pattern::EmbroiderlyProject, font_data: Vec<Vec<u8>>) -> Self {
    let mut fonts = Vec::new();
    let mut font_book = typst::text::FontBook::new();

    for fd in font_data {
      for font in typst::text::Font::iter(typst::foundations::Bytes::new(fd)) {
        font_book.push(font.info().clone());
        fonts.push(font);
      }
    }

    Self {
      embproj,

      fonts,
      font_book: typst::utils::LazyHash::new(font_book),
    }
  }

  fn prepare_document(&self, pattern_pdf: embroiderly_pattern::PatternPdf) -> Result<typst_layout::PagedDocument> {
    let template = [
      "#import \"draw.typ\": render-frames",
      "#let pattern = json(\"pattern.json\")",
      &pattern_pdf.template,
    ]
    .join("\n\n");

    let inputs = {
      use typst::foundations::{Dict, IntoValue as _};

      let mut inputs = Dict::new();
      inputs.insert("color".into(), pattern_pdf.color.into_value());

      inputs
    };

    let pattern_json = utils::compose_pattern_json(&self.embproj)?;

    let world = world::PdfExportWorld::new(template, inputs, pattern_json, &self.fonts, &self.font_book);

    typst::compile(&world)
      .output
      .map_err(|e| anyhow::anyhow!("Failed to compile Typst template: {e:?}"))
  }

  fn export_impl(&self, pattern_pdf: embroiderly_pattern::PatternPdf) -> Result<Vec<u8>> {
    let doc = self.prepare_document(pattern_pdf)?;
    typst_pdf::pdf(&doc, &typst_pdf::PdfOptions::default())
      .map_err(|warnings| anyhow::anyhow!("Failed to export PDF: {warnings:?}"))
  }
}
