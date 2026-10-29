use embroiderly_pattern::{EmbroiderlyProject, PatternPdf};

use super::*;

fn load_fixture() -> EmbroiderlyProject {
  let file_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../app/public/demo/Piggies.oxs");
  embroiderly_parsers::oxs::parse_pattern(&std::fs::read(file_path).unwrap()).unwrap()
}

fn load_fonts() -> Vec<Vec<u8>> {
  vec![
    std::fs::read(std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../app/public/fonts/FixelVariable.ttf"))
      .unwrap(),
    std::fs::read(
      std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../app/public/fonts/FixelVariableItalic.ttf"),
    )
    .unwrap(),
    std::fs::read(
      std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../app/public/symbols/Ursasoftware.ttf"),
    )
    .unwrap(),
  ]
}

mod export {
  use super::*;

  #[test]
  fn exports_pattern_to_color_pdf() {
    let worker = PdfExporter::init(load_fixture(), load_fonts());

    let CompilationOutput { output, diagnostics } = worker.export_impl(PatternPdf {
      color: true,
      ..Default::default()
    });

    assert!(output.is_some());
    assert!(diagnostics.is_empty());

    insta::with_settings!(
      {
        snapshot_path => "../testdata/export/",
        prepend_module_to_snapshot => false,
      },
      { insta::assert_binary_snapshot!("Piggies - color.pdf", output.unwrap()); }
    );
  }

  #[test]
  fn exports_pattern_to_monochrome_pdf() {
    let worker = PdfExporter::init(load_fixture(), load_fonts());

    let CompilationOutput { output, diagnostics } = worker.export_impl(PatternPdf {
      color: false,
      ..Default::default()
    });

    assert!(output.is_some());
    assert!(diagnostics.is_empty());

    insta::with_settings!(
      {
        snapshot_path => "../testdata/export/",
        prepend_module_to_snapshot => false,
      },
      { insta::assert_binary_snapshot!("Piggies - monochrome.pdf", output.unwrap()); }
    );
  }
}

mod preview {
  use super::*;

  #[test]
  fn previews_pattern_color_pdf() {
    let mut worker = PdfExporter::init(load_fixture(), load_fonts());

    let CompilationOutput { output, diagnostics } = worker.compile_document_impl(PatternPdf {
      color: true,
      ..Default::default()
    });

    worker.doc = output;

    assert!(worker.doc.as_ref().is_some_and(|doc| doc.pages().len() == 7));
    assert!(diagnostics.is_empty());

    let mut page = 0;
    loop {
      if let Some(preview) = worker.preview_impl(page) {
        insta::with_settings!(
          {
            snapshot_path => "../testdata/preview/color/",
            snapshot_suffix => format!("{page}"),
            prepend_module_to_snapshot => false,
          },
          { insta::assert_binary_snapshot!("Piggies.png", preview.buffer); }
        );
      } else {
        // We havereached the last page of the document.
        break;
      }

      page += 1;
    }
  }

  #[test]
  fn previews_pattern_monochrome_pdf() {
    let mut worker = PdfExporter::init(load_fixture(), load_fonts());

    let CompilationOutput { output, diagnostics } = worker.compile_document_impl(PatternPdf {
      color: false,
      ..Default::default()
    });

    worker.doc = output;

    assert!(worker.doc.as_ref().is_some_and(|doc| doc.pages().len() == 7));
    assert!(diagnostics.is_empty());

    let mut page = 0;
    loop {
      if let Some(preview) = worker.preview_impl(page) {
        insta::with_settings!(
          {
            snapshot_path => "../testdata/preview/monochrome/",
            snapshot_suffix => format!("{page}"),
            prepend_module_to_snapshot => false,
          },
          { insta::assert_binary_snapshot!("Piggies.png", preview.buffer); }
        );
      } else {
        // We have reached the last page of the document.
        break;
      }

      page += 1;
    }
  }
}
