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
    let worker = PdfExportWorker::init(load_fixture(), load_fonts());

    let expected =
      std::fs::read(std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(format!("./testdata/piggies.color.pdf")))
        .unwrap();
    let exported = worker
      .export_impl(PatternPdf {
        color: true,
        ..Default::default()
      })
      .unwrap();

    assert_eq!(expected, exported, "color pdf export doesn't match")
  }

  #[test]
  fn exports_pattern_to_monochrome_pdf() {
    let worker = PdfExportWorker::init(load_fixture(), load_fonts());

    let expected = std::fs::read(
      std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(format!("./testdata/piggies.monochrome.pdf")),
    )
    .unwrap();
    let exported = worker
      .export_impl(PatternPdf {
        color: false,
        ..Default::default()
      })
      .unwrap();

    assert_eq!(expected, exported, "monochrome pdf export doesn't match")
  }
}

mod preview {
  use super::*;

  #[test]
  fn previews_pattern_color_pdf() {
    let worker = PdfExportWorker::init(load_fixture(), load_fonts());
    let pattern_pdf = PatternPdf {
      color: true,
      ..Default::default()
    };

    let mut i = 0;
    loop {
      if let Ok(preview) = worker.preview_impl(pattern_pdf.clone(), i) {
        let expected = std::fs::read(
          std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join(format!("./testdata/preview/color/piggies.color.{i}.png")),
        )
        .unwrap();
        assert_eq!(expected, preview, "color pdf preview doesn't match");
      } else {
        // We reached the last page in the document.
        break;
      }

      i += 1;
    }
  }

  #[test]
  fn previews_pattern_monochrome_pdf() {
    let worker = PdfExportWorker::init(load_fixture(), load_fonts());
    let pattern_pdf = PatternPdf {
      color: false,
      ..Default::default()
    };

    let mut i = 0;
    loop {
      if let Ok(preview) = worker.preview_impl(pattern_pdf.clone(), i) {
        let expected = std::fs::read(
          std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join(format!("./testdata/preview/monochrome/piggies.monochrome.{i}.png")),
        )
        .unwrap();
        assert_eq!(expected, preview, "monochrome pdf preview doesn't match");
      } else {
        // We reached the last page in the document.
        break;
      }

      i += 1;
    }
  }
}
