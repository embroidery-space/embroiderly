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
const TEMPLATE: &str = include_str!("./typst/pattern.typ");
const DRAWING_MODULE: &str = include_str!("./typst/draw.typ");

pub fn export_pattern(
  embproj: EmbroiderlyProject,
  options: PdfExportOptions,
  variant: PdfVariant,
  symbol_font_data: Vec<Vec<u8>>,
) -> Result<Vec<u8>> {
  let typst_template = typst_as_lib::TypstEngine::builder()
    .main_file(TEMPLATE)
    .with_static_source_file_resolver([("draw.typ", DRAWING_MODULE)])
    .fonts(FONTS.iter().copied().chain(symbol_font_data.iter().map(Vec::as_slice)))
    .with_static_file_resolver([{
      use typst::syntax::{FileId, VirtualPath};
      (
        FileId::new(None, VirtualPath::new("pattern.json")),
        compose_pattern_json(&embproj, &options)?,
      )
    }])
    .build();

  let inputs = {
    use typst::foundations::{Dict, IntoValue as _};

    let mut inputs = Dict::new();
    inputs.insert("color".into(), matches!(variant, PdfVariant::Color).into_value());

    inputs
  };

  let doc = typst_template.compile_with_input(inputs).output?;

  typst_pdf::pdf(&doc, &typst_pdf::PdfOptions::default())
    .map_err(|warnings| anyhow::anyhow!("Failed to export PDF: {warnings:?}"))
}

fn compose_pattern_json(embproj: &EmbroiderlyProject, options: &PdfExportOptions) -> Result<Vec<u8>> {
  let (palette, layer) = flatten_layers_with_palette_in_visual_order(&embproj.pattern);
  let pattern_data = PatternData::new(embproj, &palette, &layer, options);
  Ok(serde_json::to_vec(&pattern_data)?)
}

fn flatten_layers_with_palette_in_visual_order(pattern: &Pattern) -> (Vec<PaletteItem>, Layer) {
  let positions = pattern.palette.positions();

  // `remap[actual_index] == display_index`, the inverse of the `positions` permutation.
  let mut remap = vec![0u32; positions.len()];
  for (display_index, &actual_index) in positions.iter().enumerate() {
    remap[actual_index as usize] = display_index as u32;
  }

  let palette = positions.iter().map(|&index| pattern.palette[index].clone()).collect();

  let mut layer = pattern.flatten_visible_layers();
  layer.fullstitches = layer
    .fullstitches
    .iter()
    .map(|s| FullStitch {
      palindex: remap[s.palindex as usize],
      ..*s
    })
    .collect();
  layer.partstitches = layer
    .partstitches
    .iter()
    .map(|s| PartStitch {
      palindex: remap[s.palindex as usize],
      ..*s
    })
    .collect();
  layer.linestitches = layer
    .linestitches
    .iter()
    .map(|s| LineStitch {
      palindex: remap[s.palindex as usize],
      ..*s
    })
    .collect();
  layer.nodestitches = layer
    .nodestitches
    .iter()
    .map(|s| NodeStitch {
      palindex: remap[s.palindex as usize],
      ..*s
    })
    .collect();
  layer.specialstitches = layer
    .specialstitches
    .iter()
    .map(|s| SpecialStitch {
      palindex: remap[s.palindex as usize],
      ..*s
    })
    .collect();

  (palette, layer)
}

/// The full pattern payload serialized to `pattern.json` for the Typst drawing module.
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct PatternData<'a> {
  info: &'a PatternInfo,

  fabric: &'a Fabric,
  grid: &'a Grid,

  palette: &'a [PaletteItem],

  fullstitches: &'a Stitches<FullStitch>,
  partstitches: &'a Stitches<PartStitch>,
  linestitches: &'a Stitches<LineStitch>,
  nodestitches: &'a Stitches<NodeStitch>,
  specialstitches: &'a Stitches<SpecialStitch>,
  special_stitch_models: &'a [SpecialStitchModel],

  pdf_export_options: &'a PdfExportOptions,
}

impl<'a> PatternData<'a> {
  fn new(
    embproj: &'a EmbroiderlyProject,
    palette: &'a [PaletteItem],
    layer: &'a Layer,
    pdf_export_options: &'a PdfExportOptions,
  ) -> Self {
    Self {
      info: &embproj.pattern.info,

      fabric: &embproj.pattern.fabric,
      grid: &embproj.display_settings.grid,

      palette,

      fullstitches: &layer.fullstitches,
      partstitches: &layer.partstitches,
      linestitches: &layer.linestitches,
      nodestitches: &layer.nodestitches,
      specialstitches: &layer.specialstitches,
      special_stitch_models: &embproj.pattern.special_stitch_models,

      pdf_export_options,
    }
  }
}
