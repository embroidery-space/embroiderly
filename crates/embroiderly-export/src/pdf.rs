use anyhow::Result;
use embroiderly_pattern::*;

pub fn export_pattern<P: AsRef<std::path::Path>>(
  patproj: &PatternProject,
  file_path: P,
  symbol_fonts_dir: std::path::PathBuf,
) -> Result<()> {
  log::debug!("Exporting Pattern({:?}) to PDF", patproj.id);
  let file_path = file_path.as_ref();

  let PatternProject { pattern, display_settings, .. } = patproj;

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
    .main_file(include_str!("../templates/pattern.typ"))
    .search_fonts_with(typst_as_lib::typst_kit_options::TypstKitFontOptions::default().include_dirs([symbol_fonts_dir]))
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
    let info = pattern_info_to_dict(content.info);
    let fabric = fabric_to_dict(content.fabric);
    let palette = content
      .palette
      .into_iter()
      .map(palette_item_to_dict)
      .collect::<Vec<_>>();

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

fn pattern_info_to_dict(info: PatternInfo) -> typst::foundations::Dict {
  typst::foundations::dict!(
    "title" => info.title,
    "author" => info.author,
    "copyright" => info.copyright,
    "description" => info.description,
  )
}

fn fabric_to_dict(fabric: Fabric) -> typst::foundations::Dict {
  typst::foundations::dict!(
    "width" => fabric.width,
    "height" => fabric.height,
    "spi" => vec![fabric.spi.0, fabric.spi.1],
    "kind" => fabric.kind,
    "name" => fabric.name,
    "color" => format!("#{}", fabric.color),
  )
}

fn palette_item_to_dict(palitem: PaletteItem) -> typst::foundations::Dict {
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
