use super::*;

fn load_pattern() -> EmbroiderlyProject {
  let file_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../app/public/demo/Piggies.oxs");
  embroiderly_parsers::oxs::parse_pattern(&std::fs::read(file_path).unwrap()).unwrap()
}

fn load_fixel_normal_font() -> PdfAsset {
  let file_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../app/public/fonts/FixelVariable.ttf");
  PdfAsset {
    file_name: file_path.file_name().unwrap().to_string_lossy().to_string(),
    content: std::fs::read(file_path).unwrap(),
  }
}

fn load_fixel_italic_font() -> PdfAsset {
  let file_path =
    std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../app/public/fonts/FixelVariableItalic.ttf");
  PdfAsset {
    file_name: file_path.file_name().unwrap().to_string_lossy().to_string(),
    content: std::fs::read(file_path).unwrap(),
  }
}

fn load_ursasoftware_font() -> PdfAsset {
  let file_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../app/public/symbols/Ursasoftware.ttf");
  PdfAsset {
    file_name: file_path.file_name().unwrap().to_string_lossy().to_string(),
    content: std::fs::read(file_path).unwrap(),
  }
}

#[test]
fn adds_fonts() {
  let mut exporter = PdfExporter::init(load_pattern(), Vec::new());

  assert_eq!(exporter.fonts.len(), 0);

  exporter.add_fonts_impl(vec![load_fixel_normal_font(), load_fixel_italic_font()]);

  assert_eq!(exporter.fonts.len(), 2);
}

#[test]
fn removes_font() {
  let mut exporter = PdfExporter::init(load_pattern(), vec![load_ursasoftware_font()]);

  assert_eq!(exporter.fonts.len(), 1);

  exporter.remove_font_impl("Ursasoftware.ttf".to_string());

  assert_eq!(exporter.fonts.len(), 0);
}

#[test]
fn exports_pattern() {
  let mut exporter = PdfExporter::init(
    load_pattern(),
    vec![
      load_fixel_normal_font(),
      load_fixel_italic_font(),
      load_ursasoftware_font(),
    ],
  );

  let CompilationOutput { output, diagnostics } =
    exporter.compile_document_impl(include_str!("./typst/pattern.typ").to_string());

  exporter.doc = output;

  assert!(exporter.doc.as_ref().is_some_and(|doc| doc.pages().len() == 13));
  assert!(diagnostics.is_empty());

  insta::with_settings!(
    {
      snapshot_path => "../testdata/export/",
      prepend_module_to_snapshot => false,
      omit_expression => true
    },
    { insta::assert_binary_snapshot!("piggies.pdf", exporter.export_impl().output.unwrap()); }
  );
}

#[test]
fn previews_pattern() {
  let mut exporter = PdfExporter::init(
    load_pattern(),
    vec![
      load_fixel_normal_font(),
      load_fixel_italic_font(),
      load_ursasoftware_font(),
    ],
  );

  let CompilationOutput { output, diagnostics } =
    exporter.compile_document_impl(include_str!("./typst/pattern.typ").to_string());

  exporter.doc = output;

  assert!(exporter.doc.as_ref().is_some_and(|doc| doc.pages().len() == 13));
  assert!(diagnostics.is_empty());

  let mut page = 0;
  loop {
    if let Some(preview) = exporter.preview_impl(page) {
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
