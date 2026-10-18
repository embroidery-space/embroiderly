use embroiderly_pattern::*;

#[cfg(test)]
#[path = "utils.test.rs"]
mod tests;

pub fn compose_pattern_json(embproj: &EmbroiderlyProject) -> anyhow::Result<Vec<u8>> {
  let (palette, layer) = flatten_layers_with_palette_in_visual_order(&embproj.pattern);
  let pattern_data = PatternData::new(embproj, &palette, &layer);
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
}

impl<'a> PatternData<'a> {
  const fn new(embproj: &'a EmbroiderlyProject, palette: &'a [PaletteItem], layer: &'a Layer) -> Self {
    Self {
      info: &embproj.pattern.info,

      fabric: &embproj.pattern.fabric,
      grid: &embproj.display_settings.grid,

      palette,

      fullstitches: &layer.fullstitches,
      partstitches: &layer.partstitches,
      linestitches: &layer.linestitches,
      nodestitches: &layer.nodestitches,
    }
  }
}
