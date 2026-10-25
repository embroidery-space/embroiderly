use anyhow::Result;
use embroiderly_pattern::{EmbroiderlyProject, PatternPdf};
use typst::foundations::{Bytes, Dict, IntoValue as _, Value};
use typst::text::{Font, FontBook};
use typst::utils::LazyHash;
use typst_layout::PagedDocument;
use wasm_bindgen::prelude::*;

mod conversion;
mod world;

#[cfg(test)]
#[path = "lib.test.rs"]
mod tests;

#[wasm_bindgen]
pub struct PdfExporter {
  /// The target pattern for export.
  embproj: Value,

  /// An array of fonts (both text and symbol) used in the document.
  fonts: Vec<Font>,
  /// Pre-built font book metadata.
  font_book: LazyHash<FontBook>,

  /// The working document used for previewing.
  doc: Option<PagedDocument>,
}

#[wasm_bindgen]
impl PdfExporter {
  #[wasm_bindgen(constructor)]
  pub fn new(embproj: &[u8], font_data: Vec<js_sys::Uint8Array>) -> Result<Self, JsError> {
    let embproj = borsh::from_slice(embproj).map_err(|e| JsError::new(&e.to_string()))?;
    let font_data = font_data.into_iter().map(|js_array| js_array.to_vec());
    Ok(Self::init(embproj, font_data))
  }

  #[wasm_bindgen(js_name = "compileDocument")]
  pub fn compile_document(&mut self, pattern_pdf: &[u8]) -> Result<JsValue, JsError> {
    let pattern_pdf = borsh::from_slice(pattern_pdf).map_err(|e| JsError::new(&e.to_string()))?;

    let CompilationOutput { output, diagnostics } = self.compile_document_impl(pattern_pdf);
    let total_pages = if let Some(doc) = output {
      let total_pages = doc.pages().len();

      self.doc = Some(doc);

      Some(total_pages)
    } else {
      None
    };

    Ok(serde_wasm_bindgen::to_value(&CompilationOutput {
      output: total_pages,
      diagnostics,
    })?)
  }

  #[wasm_bindgen]
  pub fn export(&self, pattern_pdf: &[u8]) -> Result<JsValue, JsError> {
    let pattern_pdf = borsh::from_slice(pattern_pdf).map_err(|e| JsError::new(&e.to_string()))?;
    Ok(serde_wasm_bindgen::to_value(&self.export_impl(pattern_pdf))?)
  }

  #[wasm_bindgen]
  pub fn preview(&self, page: usize) -> Result<RenderedPage, JsError> {
    self.preview_impl(page).map_err(|e| JsError::new(&e.to_string()))
  }
}

impl PdfExporter {
  #[must_use]
  pub fn init(embproj: EmbroiderlyProject, font_data: impl IntoIterator<Item = Vec<u8>>) -> Self {
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

      doc: None,
    }
  }

  fn compile_document_impl(&self, pattern_pdf: PatternPdf) -> CompilationOutput<PagedDocument> {
    let PatternPdf { template, color } = pattern_pdf;
    let inputs = {
      let mut inputs = Dict::new();

      inputs.insert("color".into(), color.into_value());
      inputs.insert("pattern".into(), self.embproj.clone());

      inputs
    };

    let world = world::PdfExportWorld::new(template, inputs, &self.fonts, &self.font_book);
    let typst::diag::Warned {
      output: result,
      warnings,
    } = typst::compile(&world);

    match result {
      Ok(output) => CompilationOutput {
        output: Some(output),
        diagnostics: warnings
          .into_iter()
          .filter_map(|diag| map_diagnostic(&world, diag))
          .collect(),
      },
      Err(errors) => CompilationOutput {
        output: None,
        diagnostics: errors
          .into_iter()
          .chain(warnings)
          .filter_map(|diag| map_diagnostic(&world, diag))
          .collect(),
      },
    }
  }

  fn export_impl(&self, pattern_pdf: PatternPdf) -> CompilationOutput<Vec<u8>> {
    let CompilationOutput {
      output: doc,
      diagnostics,
    } = self.compile_document_impl(pattern_pdf);
    if doc.is_none() {
      return CompilationOutput {
        output: None,
        diagnostics,
      };
    }

    let result = typst_pdf::pdf(&doc.unwrap(), &typst_pdf::PdfOptions::default());
    match result {
      Ok(buf) => CompilationOutput {
        output: Some(buf),
        diagnostics: Vec::new(),
      },

      // Currently, we don't handle PDF diagnostics, as we don't know what can go wrong and how to display them on the interface.
      Err(_errors) => CompilationOutput {
        output: None,
        diagnostics: Vec::new(),
      },
    }
  }

  fn preview_impl(&self, page: usize) -> Result<RenderedPage> {
    if let Some(doc) = self.doc.as_ref() {
      let page = doc
        .pages()
        .get(page)
        .ok_or(anyhow::anyhow!("Page index is out of bounds"))?;

      let pixmap = typst_render::render(page, &typst_render::RenderOptions::default());

      Ok(RenderedPage {
        width: pixmap.width(),
        height: pixmap.height(),

        // In tests, return the encoded PNG to inspect the result.
        #[cfg(test)]
        buffer: pixmap.encode_png().unwrap(),

        // In production, return raw buffer to display it on the canvas.
        #[cfg(not(test))]
        buffer: pixmap.take(),
      })
    } else {
      anyhow::bail!("The working document was not built");
    }
  }
}

#[wasm_bindgen]
pub struct RenderedPage {
  buffer: Vec<u8>,

  pub width: u32,
  pub height: u32,
}

#[wasm_bindgen]
impl RenderedPage {
  #[allow(clippy::must_use_candidate, clippy::missing_const_for_fn)]
  #[wasm_bindgen(getter)]
  pub fn ptr(&self) -> *const u8 {
    self.buffer.as_ptr()
  }

  #[allow(
    clippy::must_use_candidate,
    clippy::missing_const_for_fn,
    clippy::len_without_is_empty
  )]
  #[wasm_bindgen(getter)]
  pub fn len(&self) -> usize {
    self.buffer.len()
  }
}

#[derive(Debug, serde::Serialize)]
pub struct CompilationOutput<T> {
  output: Option<T>,
  diagnostics: Vec<Diagnostic>,
}

#[derive(Debug, serde::Serialize)]
pub struct Diagnostic {
  from: usize,
  to: usize,
  severity: DiagnosticSeverity,
  message: String,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "lowercase")]
pub enum DiagnosticSeverity {
  Error,
  Warning,
}

impl From<typst::diag::Severity> for DiagnosticSeverity {
  fn from(value: typst::diag::Severity) -> Self {
    match value {
      typst::diag::Severity::Error => Self::Error,
      typst::diag::Severity::Warning => Self::Warning,
    }
  }
}

fn map_diagnostic(world: &world::PdfExportWorld, diag: typst::diag::SourceDiagnostic) -> Option<Diagnostic> {
  let std::ops::Range { start, end } = typst::WorldExt::range(&world, diag.span)?;
  Some(Diagnostic {
    from: start,
    to: end,
    severity: diag.severity.into(),
    message: diag.message.to_string(),
  })
}
