use anyhow::Result;
use embroiderly_pattern::*;

use crate::PdfVariant;

const FONTS: &[&[u8]] = &[
  include_bytes!("../assets/fonts/LibertinusSerif-Italic.ttf"),
  include_bytes!("../assets/fonts/LibertinusSerif-Regular.ttf"),
  include_bytes!("../assets/fonts/LibertinusSerif-SemiBold.ttf"),
  include_bytes!("../assets/fonts/LibertinusSerif-SemiBoldItalic.ttf"),
  include_bytes!("../assets/fonts/LibertinusSerif-Bold.ttf"),
  include_bytes!("../assets/fonts/LibertinusSerif-BoldItalic.ttf"),
];
const TEMPLATE: &str = include_str!("../assets/templates/pattern.typ");

pub fn export_pattern(
  patproj: PatternProject,
  options: PdfExportOptions,
  variant: PdfVariant,
  symbol_font_data: Vec<Vec<u8>>,
) -> Result<Vec<u8>> {
  let frames = {
    let color = matches!(variant, PdfVariant::Color);
    embroiderly_image::svg::generate_svg(&patproj, color, options.frame_options)?
      .into_iter()
      .enumerate()
      .map(|(i, image)| (format!("image{i}.svg"), image))
      .collect::<Vec<_>>()
  };

  let typst_content = TypstContent {
    info: patproj.pattern.info.clone(),
    fabric: patproj.pattern.fabric.clone(),
    palette: patproj.pattern.palette,
    frames: frames.iter().map(|(name, _)| name).cloned().collect(),
    options,
  };

  let typst_template = typst_as_lib::TypstEngine::builder()
    .main_file(TEMPLATE)
    .fonts(FONTS.iter().copied().chain(symbol_font_data.iter().map(Vec::as_slice)))
    .with_static_file_resolver(frames.into_iter().map(|(name, content)| {
      use typst::syntax::{FileId, VirtualPath};
      (FileId::new(None, VirtualPath::new(name)), content)
    }))
    .build();

  let doc = typst_template.compile_with_input(typst_content).output?;

  typst_pdf::pdf(&doc, &typst_pdf::PdfOptions::default())
    .map_err(|warnings| anyhow::anyhow!("Failed to export PDF: {warnings:?}"))
}

#[derive(Debug)]
struct TypstContent {
  info: PatternInfo,
  fabric: Fabric,
  palette: Palette,
  frames: Vec<String>,
  options: PdfExportOptions,
}

impl From<TypstContent> for typst::foundations::Dict {
  fn from(content: TypstContent) -> Self {
    let info = pattern_info_to_dict(content.info);
    let fabric = fabric_to_dict(content.fabric);
    let palette = content
      .palette
      .positions()
      .iter()
      .map(|&index| palette_item_to_dict(content.palette[index].clone()))
      .collect::<Vec<_>>();
    let options = pdf_export_options_to_dict(content.options);

    typst::foundations::dict!(
      "info" => info,
      "fabric" => fabric,
      "palette" => palette,
      "frames" => content.frames,
      "options" => options,
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
  let symbol = palitem.symbol.as_ref().map(|s| {
    typst::foundations::dict!(
      "char" => s.char.to_string(),
      "font" => s.font.clone(),
    )
  });

  typst::foundations::dict!(
    "brand" => palitem.brand,
    "number" => palitem.number,
    "name" => palitem.name,
    "color" => format!("#{}", palitem.color),
    "symbol" => symbol,
  )
}

fn pdf_export_options_to_dict(options: PdfExportOptions) -> typst::foundations::Dict {
  typst::foundations::dict!(
    "center_frames" => options.center_frames,
    "enumerate_frames" => options.enumerate_frames,
  )
}
