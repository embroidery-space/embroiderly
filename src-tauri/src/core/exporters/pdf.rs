use anyhow::Result;

use crate::core::pattern::*;

pub fn export_pattern<P: AsRef<std::path::Path>>(
  patproj: &PatternProject,
  file_path: P,
  text_fonts: Vec<std::path::PathBuf>,
  symbol_fonts: Vec<std::path::PathBuf>,
) -> Result<()> {
  log::debug!("Exporting Pattern({:?}) to PDF", patproj.id);
  let file_path = file_path.as_ref();

  let PatternProject { pattern, display_settings, .. } = patproj;

  let text_fonts = text_fonts.iter().map(std::fs::read).collect::<Result<Vec<_>, _>>()?;
  let symbol_fonts = symbol_fonts.iter().map(std::fs::read).collect::<Result<Vec<_>, _>>()?;

  let pattern_images = [super::svg::export_pattern(patproj, 14.0)?];
  let pattern_images = std::collections::HashMap::<String, Vec<u8>>::from_iter(
    pattern_images
      .into_iter()
      .enumerate()
      .map(|(i, image)| (format!("image{}.svg", i), image)),
  );

  let typst_content = TypstContent {
    info: pattern.info.clone(),
    fabric: pattern.fabric.clone(),
    palette: pattern.palette.clone(),
    default_symbol_font: display_settings.default_symbol_font.clone(),
    images: pattern_images.keys().cloned().collect(),
  };
  let typst_template = typst_as_lib::TypstEngine::builder()
    .main_file(include_str!("./templates/pattern.typ"))
    .fonts(text_fonts.into_iter().chain(symbol_fonts).collect::<Vec<_>>())
    .with_static_file_resolver(
      pattern_images
        .into_iter()
        .map(|(name, content)| {
          use typst::syntax::{FileId, VirtualPath};
          (FileId::new(None, VirtualPath::new(name)), content)
        })
        .collect::<Vec<_>>(),
    )
    .build();

  let doc = {
    let result = typst_template.compile_with_input(typst_content);
    for warning in &result.warnings {
      log::warn!("Typst compilation warning: {:?}", warning);
    }
    result.output?
  };

  let pdf_options = Default::default();
  let pdf_bytes =
    typst_pdf::pdf(&doc, &pdf_options).map_err(|warnings| anyhow::anyhow!("Failed to export PDF: {:?}", warnings))?;

  std::fs::write(file_path, pdf_bytes)?;

  log::debug!("Pattern({:?}) exported to PDF", patproj.id);
  Ok(())
}

#[derive(Debug)]
struct TypstContent {
  info: PatternInfo,
  fabric: Fabric,
  palette: Vec<PaletteItem>,
  default_symbol_font: String,
  images: Vec<String>,
}

impl From<TypstContent> for typst::foundations::Dict {
  fn from(content: TypstContent) -> Self {
    let info: typst::foundations::Dict = content.info.into();
    let fabric: typst::foundations::Dict = content.fabric.into();
    let palette: Vec<typst::foundations::Dict> = content.palette.into_iter().map(Into::into).collect();

    // This dictionary will be passed to the Typst template through `sys.inputs`.
    typst::foundations::dict!(
      "info" => info,
      "fabric" => fabric,
      "palette" => palette,
      "default_symbol_font" => content.default_symbol_font,
      "images" => content.images,
    )
  }
}

impl From<PatternInfo> for typst::foundations::Dict {
  fn from(info: PatternInfo) -> Self {
    typst::foundations::dict!(
      "title" => info.title,
      "author" => info.author,
      "copyright" => info.copyright,
      "description" => info.description,
    )
  }
}

impl From<Fabric> for typst::foundations::Dict {
  fn from(fabric: Fabric) -> Self {
    typst::foundations::dict!(
      "width" => fabric.width,
      "height" => fabric.height,
      "spi" => vec![fabric.spi.0, fabric.spi.1],
      "kind" => fabric.kind,
      "name" => fabric.name,
      "color" => format!("#{}", fabric.color),
    )
  }
}

impl From<PaletteItem> for typst::foundations::Dict {
  fn from(palitem: PaletteItem) -> Self {
    let symbol = palitem.get_symbol();
    typst::foundations::dict!(
      "brand" => palitem.brand,
      "number" => palitem.number,
      "name" => palitem.name,
      "color" => format!("#{}", palitem.color),
      "symbol_font" => palitem.symbol_font,
      "symbol" => symbol,
    )
  }
}
