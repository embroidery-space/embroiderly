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

#[test]
fn exports_pattern() {
  let worker = PdfExporter::init(load_fixture(), load_fonts());

  let CompilationOutput { output, diagnostics } = worker.export_impl(PatternPdf::default());

  assert!(output.is_some());
  assert!(diagnostics.is_empty());

  insta::with_settings!(
    {
      snapshot_path => "../testdata/export/",
      prepend_module_to_snapshot => false,
      omit_expression => true
    },
    { insta::assert_binary_snapshot!("piggies.pdf", output.unwrap()); }
  );
}

#[test]
fn previews_pattern() {
  let mut worker = PdfExporter::init(load_fixture(), load_fonts());

  let CompilationOutput { output, diagnostics } = worker.compile_document_impl(PatternPdf::default());

  worker.doc = output;

  assert!(worker.doc.as_ref().is_some_and(|doc| doc.pages().len() == 13));
  assert!(diagnostics.is_empty());

  let mut page = 0;
  loop {
    if let Some(preview) = worker.preview_impl(page) {
      insta::with_settings!(
        {
          snapshot_path => "../testdata/preview/",
          snapshot_suffix => format!("{}", page + 1),
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
