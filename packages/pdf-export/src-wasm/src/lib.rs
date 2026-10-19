use anyhow::Result;
use embroiderly_pattern::{EmbroiderlyProject, PatternPdf};
use typst::foundations::{Bytes, Dict, IntoValue as _, Value};
use typst::text::{Font, FontBook};
use typst::utils::LazyHash;
use wasm_bindgen::prelude::*;

mod conversion;
mod world;

#[cfg(test)]
#[path = "lib.test.rs"]
mod tests;

#[wasm_bindgen]
pub struct PdfExportWorker {
  /// The target pattern for export.
  embproj: Value,

  /// An array of fonts (both text and symbol) used in the document.
  fonts: Vec<Font>,
  /// Pre-built font book metadata.
  font_book: LazyHash<FontBook>,
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
  pub fn init(embproj: EmbroiderlyProject, font_data: Vec<Vec<u8>>) -> Self {
    let mut fonts = Vec::new();
    let mut font_book = FontBook::new();

    for fd in font_data {
      for font in Font::iter(Bytes::new(fd)) {
        font_book.push(font.info().clone());
        fonts.push(font);
      }
    }

    Self {
      embproj: conversion::convert_embproj_into_typst_value(embproj),

      fonts,
      font_book: LazyHash::new(font_book),
    }
  }

  fn prepare_document(&self, pattern_pdf: PatternPdf) -> Result<typst_layout::PagedDocument> {
    let PatternPdf { template, color } = pattern_pdf;
    let inputs = {
      let mut inputs = Dict::new();

      inputs.insert("color".into(), color.into_value());
      inputs.insert("pattern".into(), self.embproj.clone());

      inputs
    };

    let world = world::PdfExportWorld::new(template, inputs, &self.fonts, &self.font_book);
    typst::compile(&world)
      .output
      .map_err(|e| anyhow::anyhow!("Failed to compile Typst template: {e:?}"))
  }

  fn export_impl(&self, pattern_pdf: PatternPdf) -> Result<Vec<u8>> {
    let doc = self.prepare_document(pattern_pdf)?;
    typst_pdf::pdf(&doc, &typst_pdf::PdfOptions::default())
      .map_err(|warnings| anyhow::anyhow!("Failed to export PDF: {warnings:?}"))
  }

  fn preview_impl(&self, pattern_pdf: PatternPdf, page: usize) -> Result<Vec<u8>> {
    let doc = self.prepare_document(pattern_pdf)?;
    let page = doc
      .pages()
      .get(page)
      .ok_or(anyhow::anyhow!("Page index is out of bounds"))?;

    let pixmap = typst_render::render(page, &typst_render::RenderOptions::default());

    // In tests, return the encoded PNG to inspect the result.
    #[cfg(test)]
    return pixmap
      .encode_png()
      .map_err(|e| anyhow::anyhow!("Failed to encode PNG: {e:?}"));

    // In production, return raw buffer to display it on the canvas.
    #[cfg(not(test))]
    return Ok(pixmap.take());
  }
}
