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

#[rstest::rstest]
#[case(true)]
#[case(false)]
fn exports_pattern(#[case] color: bool) {
  let worker = PdfExporter::init(load_fixture(), load_fonts());

  let CompilationOutput { output, diagnostics } = worker.export_impl(PatternPdf {
    color,
    ..Default::default()
  });

  assert!(output.is_some());
  assert!(diagnostics.is_empty());

  insta::with_settings!(
    {
      snapshot_path => "../testdata/export/",
      snapshot_suffix => if color { "color" } else { "monochrome" },
      prepend_module_to_snapshot => false,
      omit_expression => true
    },
    { insta::assert_binary_snapshot!("piggies.pdf", output.unwrap()); }
  );
}

#[rstest::rstest]
#[case(true)]
#[case(false)]
fn previews_pattern_color_pdf(#[case] color: bool) {
  let mut worker = PdfExporter::init(load_fixture(), load_fonts());

  let CompilationOutput { output, diagnostics } = worker.compile_document_impl(PatternPdf {
    color,
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
          snapshot_path => format!("../testdata/preview/{}/", if color { "color" } else { "monochrome" }),
          snapshot_suffix => format!("{page}"),
          prepend_module_to_snapshot => false,
          omit_expression => true
        },
        { insta::assert_binary_snapshot!("piggies.png", preview.buffer); }
      );
    } else {
      // We have reached the last page of the document.
      break;
    }

    page += 1;
  }
}
