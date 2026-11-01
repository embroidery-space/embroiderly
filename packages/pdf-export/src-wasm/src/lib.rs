use anyhow::Result;
use typst::foundations::{Bytes, Dict};
use typst::text::{Font, FontBook};
use typst::utils::LazyHash;
use typst::{Library, LibraryExt as _};
use typst_layout::PagedDocument;
use wasm_bindgen::prelude::*;

mod conversion;
mod world;

#[cfg(test)]
#[path = "lib.test.rs"]
mod tests;

#[wasm_bindgen]
pub struct PdfExporter {
  /// The app text font (Fixel) and symbol fonts used in the pattern.
  base_fonts: Vec<Font>,
  /// Fonts the user has uploaded manually.
  custom_fonts: Vec<Font>,

  /// Pre-built font book metadata.
  font_book: LazyHash<FontBook>,
  /// Pre-build standard library with inputs.
  library: LazyHash<Library>,

  /// The working document.
  doc: Option<PagedDocument>,
}

#[wasm_bindgen]
impl PdfExporter {
  #[wasm_bindgen(constructor)]
  pub fn new(
    embproj: &[u8],
    base_fonts: Vec<js_sys::Uint8Array>,
    custom_fonts: Vec<js_sys::Uint8Array>,
  ) -> Result<Self, JsError> {
    let embproj = borsh::from_slice(embproj).map_err(|e| JsError::new(&e.to_string()))?;

    let base_fonts = base_fonts.into_iter().map(|js_array| js_array.to_vec());
    let custom_fonts = custom_fonts.into_iter().map(|js_array| js_array.to_vec());

    Ok(Self::init(embproj, base_fonts, custom_fonts))
  }

  #[wasm_bindgen(js_name = "addCustomFonts")]
  pub fn add_custom_fonts(&mut self, fonts: Vec<js_sys::Uint8Array>) {
    let fonts = fonts.into_iter().map(|js_array| js_array.to_vec());
    self.add_custom_fonts_impl(fonts);
  }

  #[wasm_bindgen(js_name = "removeCustomFont")]
  pub fn remove_custom_font(&mut self, index: usize) {
    self.remove_custom_font_impl(index);
  }

  #[wasm_bindgen(js_name = "compileDocument")]
  pub fn compile_document(&mut self, template: String) -> Result<JsValue, JsError> {
    let CompilationOutput { output, diagnostics } = self.compile_document_impl(template);
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
  pub fn export(&self) -> Result<JsValue, JsError> {
    Ok(serde_wasm_bindgen::to_value(&self.export_impl())?)
  }

  #[wasm_bindgen]
  pub fn preview(&self, page: usize) -> Option<RenderedPage> {
    self.preview_impl(page)
  }
}

impl PdfExporter {
  #[must_use]
  fn init(
    embproj: embroiderly_pattern::EmbroiderlyProject,
    base_fonts: impl IntoIterator<Item = Vec<u8>>,
    custom_fonts: impl IntoIterator<Item = Vec<u8>>,
  ) -> Self {
    let base_fonts: Vec<Font> = base_fonts
      .into_iter()
      .flat_map(|buf| Font::iter(Bytes::new(buf)))
      .collect();
    let custom_fonts: Vec<Font> = custom_fonts
      .into_iter()
      .flat_map(|buf| Font::iter(Bytes::new(buf)))
      .collect();

    let font_book = FontBook::from_fonts(base_fonts.iter().chain(&custom_fonts));
    let library = Library::builder()
      .with_inputs({
        let mut inputs = Dict::new();

        inputs.insert("pattern".into(), conversion::convert_embproj_into_typst_value(embproj));

        inputs
      })
      .build();

    Self {
      base_fonts,
      custom_fonts,

      font_book: LazyHash::new(font_book),
      library: LazyHash::new(library),

      doc: None,
    }
  }

  fn add_custom_fonts_impl(&mut self, fonts: impl IntoIterator<Item = Vec<u8>>) {
    self
      .custom_fonts
      .extend(fonts.into_iter().flat_map(|buf| Font::iter(Bytes::new(buf))));
    self.font_book = LazyHash::new(FontBook::from_fonts(self.base_fonts.iter().chain(&self.custom_fonts)));
  }

  fn remove_custom_font_impl(&mut self, index: usize) {
    self.custom_fonts.remove(index);
    self.font_book = LazyHash::new(FontBook::from_fonts(self.base_fonts.iter().chain(&self.custom_fonts)));
  }

  fn compile_document_impl(&self, template: String) -> CompilationOutput<PagedDocument> {
    let world = world::PdfExportWorld::new(
      template,
      (&self.base_fonts, &self.custom_fonts),
      &self.font_book,
      &self.library,
    );
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

  fn export_impl(&self) -> CompilationOutput<Vec<u8>> {
    if self.doc.is_none() {
      return CompilationOutput {
        output: None,
        diagnostics: Vec::new(),
      };
    }

    let result = typst_pdf::pdf(
      self.doc.as_ref().unwrap(),
      &typst_pdf::PdfOptions {
        creator: typst::foundations::Smart::Custom(Some(format!("Embroiderly {}", env!("CARGO_PKG_VERSION")))),
        standards: typst_pdf::PdfStandards::new(&[typst_pdf::PdfStandard::V_2_0])
          .expect("PDF v2.0 can't conflict, as it is the only specified PDF standard."),
        ..Default::default()
      },
    );
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

  fn preview_impl(&self, page: usize) -> Option<RenderedPage> {
    let page = self.doc.as_ref()?.pages().get(page)?;

    let pixmap = typst_render::render(page, &typst_render::RenderOptions::default());

    Some(RenderedPage {
      width: pixmap.width(),
      height: pixmap.height(),

      // In tests, return the encoded PNG to inspect the result.
      #[cfg(test)]
      buffer: pixmap.encode_png().unwrap(),

      // In production, return raw buffer to display it on the canvas.
      #[cfg(not(test))]
      buffer: pixmap.take(),
    })
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
