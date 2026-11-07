use std::sync::LazyLock;

use indexmap::IndexMap;
use typst::Library;
use typst::diag::{FileError, FileResult};
use typst::foundations::{Bytes, Datetime, Duration};
use typst::syntax::{FileId, Source};
use typst::text::{Font, FontBook};
use typst::utils::LazyHash;

static MAIN_ID: LazyLock<FileId> = LazyLock::new(|| crate::path::project_path("sources/main.typ".to_string()));

static DRAW_ID: LazyLock<FileId> = LazyLock::new(|| crate::path::project_path("sources/draw.typ".to_string()));
static DRAW_SOURCE: LazyLock<Source> =
  LazyLock::new(|| Source::new(*DRAW_ID, include_str!("./typst/draw.typ").to_string()));

pub struct PdfExportWorld<'a> {
  main_source: Source,

  files: &'a IndexMap<FileId, Bytes>,
  fonts: &'a IndexMap<FileId, Font>,

  font_book: &'a LazyHash<FontBook>,
  library: &'a LazyHash<Library>,
}

impl<'a> PdfExportWorld<'a> {
  pub fn new(
    template: String,
    files: &'a IndexMap<FileId, Bytes>,
    fonts: &'a IndexMap<FileId, Font>,
    font_book: &'a LazyHash<FontBook>,
    library: &'a LazyHash<Library>,
  ) -> Self {
    Self {
      main_source: Source::new(*MAIN_ID, template),

      files,
      fonts,

      font_book,
      library,
    }
  }
}

impl typst::World for PdfExportWorld<'_> {
  fn library(&self) -> &LazyHash<Library> {
    self.library
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
    match self.files.get(&id) {
      Some(content) => Ok(content.clone()),
      None => Err(FileError::NotFound(id.vpath().get_without_slash().into())),
    }
  }

  fn font(&self, index: usize) -> Option<Font> {
    let (_file_id, font) = self.fonts.get_index(index)?;
    Some(font.to_owned())
  }

  fn today(&self, offset: Option<Duration>) -> Option<Datetime> {
    let now = match offset {
      Some(offset) => {
        let utc = time::OffsetDateTime::now_utc();
        utc.checked_add(offset.into())?
      }
      None => time::OffsetDateTime::now_local().ok()?,
    };
    Some(Datetime::Datetime(time::PrimitiveDateTime::new(now.date(), now.time())))
  }
}
