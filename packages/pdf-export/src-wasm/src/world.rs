use std::sync::LazyLock;

use typst::diag::{FileError, FileResult};
use typst::foundations::{Bytes, Datetime, Dict};
use typst::syntax::{FileId, RootedPath, Source, VirtualPath, VirtualRoot};
use typst::text::{Font, FontBook};
use typst::utils::LazyHash;
use typst::{Library, LibraryExt as _};

static MAIN_ID: LazyLock<FileId> =
  LazyLock::new(|| RootedPath::new(VirtualRoot::Project, VirtualPath::new("main.typ").unwrap()).intern());

static DRAW_ID: LazyLock<FileId> =
  LazyLock::new(|| RootedPath::new(VirtualRoot::Project, VirtualPath::new("draw.typ").unwrap()).intern());
static DRAW_SOURCE: LazyLock<Source> =
  LazyLock::new(|| Source::new(*DRAW_ID, include_str!("./typst/draw.typ").to_string()));

pub struct PdfExportWorld<'a> {
  main_source: Source,
  library: LazyHash<Library>,
  fonts: &'a [Font],
  font_book: &'a LazyHash<FontBook>,
}

impl<'a> PdfExportWorld<'a> {
  pub fn new(template: String, inputs: Dict, fonts: &'a [Font], font_book: &'a LazyHash<FontBook>) -> Self {
    Self {
      main_source: Source::new(*MAIN_ID, template),
      library: LazyHash::new(Library::builder().with_inputs(inputs).build()),
      fonts,
      font_book,
    }
  }
}

impl typst::World for PdfExportWorld<'_> {
  fn library(&self) -> &LazyHash<Library> {
    &self.library
  }

  fn book(&self) -> &LazyHash<FontBook> {
    self.font_book
  }

  fn main(&self) -> FileId {
    *MAIN_ID
  }

  fn source(&self, id: FileId) -> FileResult<Source> {
    if id == *MAIN_ID {
      Ok(self.main_source.clone())
    } else if id == *DRAW_ID {
      Ok(DRAW_SOURCE.clone())
    } else {
      Err(FileError::NotFound(id.vpath().get_without_slash().into()))
    }
  }

  fn file(&self, id: FileId) -> FileResult<Bytes> {
    Err(FileError::NotFound(id.vpath().get_without_slash().into()))
  }

  fn font(&self, index: usize) -> Option<Font> {
    self.fonts.get(index).cloned()
  }

  fn today(&self, _offset: Option<typst::foundations::Duration>) -> Option<Datetime> {
    None
  }
}
