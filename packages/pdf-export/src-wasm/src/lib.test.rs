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

    let expected = std::fs::read(
      std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(format!("./testdata/export/piggies.color.pdf")),
    )
    .unwrap();
    let CompilationOutput {
      output: exported,
      diagnostics,
    } = worker.export_impl(PatternPdf {
      color: true,
      ..Default::default()
    });

    assert!(exported.is_some());
    assert!(diagnostics.is_empty());
    assert_eq!(expected, exported.unwrap(), "color pdf export doesn't match")
  }

  #[test]
  fn exports_pattern_to_monochrome_pdf() {
    let worker = PdfExporter::init(load_fixture(), load_fonts());

    let expected = std::fs::read(
      std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(format!("./testdata/export/piggies.monochrome.pdf")),
    )
    .unwrap();
    let CompilationOutput {
      output: exported,
      diagnostics,
    } = worker.export_impl(PatternPdf {
      color: false,
      ..Default::default()
    });

    assert!(exported.is_some());
    assert!(diagnostics.is_empty());
    assert_eq!(expected, exported.unwrap(), "monochrome pdf export doesn't match")
  }
}

mod preview {
  use super::*;

  #[test]
  fn previews_pattern_color_pdf() {
    let worker = PdfExporter::init(load_fixture(), load_fonts());

    let CompilationOutput { output, diagnostics } = worker.compile_document_impl(PatternPdf {
      color: true,
      ..Default::default()
    });

    assert!(output.is_some_and(|doc| doc.pages().len() == 7));
    assert!(diagnostics.is_empty());

    let mut page = 0;
    loop {
      if let Ok(preview) = worker.preview_impl(page) {
        let expected = std::fs::read(
          std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join(format!("./testdata/preview/color/piggies.color.{page}.png")),
        )
        .unwrap();
        assert_eq!(expected, preview.buffer, "color pdf preview doesn't match");
      } else {
        // We havereached the last page of the document.
        break;
      }

      page += 1;
    }
  }

  #[test]
  fn previews_pattern_monochrome_pdf() {
    let worker = PdfExporter::init(load_fixture(), load_fonts());

    let CompilationOutput { output, diagnostics } = worker.compile_document_impl(PatternPdf {
      color: false,
      ..Default::default()
    });

    assert!(output.is_some_and(|doc| doc.pages().len() == 7));
    assert!(diagnostics.is_empty());

    let mut page = 0;
    loop {
      if let Ok(preview) = worker.preview_impl(page) {
        let expected = std::fs::read(
          std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join(format!("./testdata/preview/monochrome/piggies.monochrome.{page}.png")),
        )
        .unwrap();
        assert_eq!(expected, preview.buffer, "monochrome pdf preview doesn't match");
      } else {
        // We have reached the last page of the document.
        break;
      }

      page += 1;
    }
  }
}
