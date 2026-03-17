use xsp_parsers::pmaker;

use super::layer::*;
use super::palette::*;
use super::stitches::*;

#[cfg(test)]
#[path = "./pattern.test.rs"]
mod tests;

#[derive(Debug, Clone)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct Pattern {
  pub info: PatternInfo,
  pub fabric: Fabric,
  pub palette: Palette,
  pub layers: Vec<Layer>,
  pub special_stitch_models: Vec<SpecialStitchModel>,
}

impl Default for Pattern {
  fn default() -> Self {
    Self {
      info: PatternInfo::default(),
      fabric: Fabric::default(),
      palette: Palette::default(),
      layers: vec![Layer::default()],
      special_stitch_models: Vec::new(),
    }
  }
}

impl Pattern {
  #[must_use]
  pub fn new(fabric: Fabric) -> Self {
    Self {
      fabric,
      ..Self::default()
    }
  }

  /// Returns the number of full and petite stitches across all layers.
  #[must_use]
  pub fn full_stitches_number(&self) -> (usize, usize) {
    self
      .layers
      .iter()
      .map(Layer::full_stitches_number)
      .fold((0, 0), |(af, ap), (bf, bp)| (af + bf, ap + bp))
  }

  /// Returns the number of half and quarter stitches across all layers.
  #[must_use]
  pub fn part_stitches_number(&self) -> (usize, usize) {
    self
      .layers
      .iter()
      .map(Layer::part_stitches_number)
      .fold((0, 0), |(ah, aq), (bh, bq)| (ah + bh, aq + bq))
  }

  /// Returns the number of back and straight stitches across all layers.
  #[must_use]
  pub fn line_stitches_number(&self) -> (usize, usize) {
    self
      .layers
      .iter()
      .map(Layer::line_stitches_number)
      .fold((0, 0), |(ab, ast), (bb, bst)| (ab + bb, ast + bst))
  }

  /// Returns the number of french knots and beads across all layers.
  #[must_use]
  pub fn node_stitches_number(&self) -> (usize, usize) {
    self
      .layers
      .iter()
      .map(Layer::node_stitches_number)
      .fold((0, 0), |(ak, ab), (bk, bb)| (ak + bk, ab + bb))
  }

  /// Get a stitch from the specified layer.
  #[must_use]
  pub fn get_stitch(&self, layer_index: usize, stitch: &Stitch) -> Option<Stitch> {
    self.layers[layer_index].get_stitch(stitch)
  }

  /// Check if the specified layer contains a stitch.
  #[must_use]
  pub fn contains_stitch(&self, layer_index: usize, stitch: &Stitch) -> bool {
    self.layers[layer_index].contains_stitch(stitch)
  }

  /// Adds many stitches to the specified layer.
  pub fn add_stitches(&mut self, layer_index: usize, stitches: Vec<Stitch>) {
    self.layers[layer_index].add_stitches(stitches);
  }

  /// Adds a stitch to the specified layer and returns any conflicts that may have arisen.
  pub fn add_stitch(&mut self, layer_index: usize, stitch: Stitch) -> Vec<Stitch> {
    self.layers[layer_index].add_stitch(stitch)
  }

  /// Removes many stitches from the specified layer.
  pub fn remove_stitches(&mut self, layer_index: usize, stitches: Vec<Stitch>) {
    self.layers[layer_index].remove_stitches(stitches);
  }

  /// Removes and returns a stitch from the specified layer.
  pub fn remove_stitch(&mut self, layer_index: usize, stitch: Stitch) -> Option<Stitch> {
    self.layers[layer_index].remove_stitch(stitch)
  }

  /// Removes and returns all stitches with a given palette index from all layers.
  pub fn remove_stitches_by_palindexes(&mut self, palindexes: &[u32]) -> Vec<Stitch> {
    self
      .layers
      .iter_mut()
      .flat_map(|l| l.remove_stitches_by_palindexes(palindexes))
      .collect()
  }

  /// Removes all stitches outside the given bounds from all layers.
  pub fn remove_stitches_outside_bounds(&mut self, bounds: Bounds) -> Vec<Stitch> {
    self
      .layers
      .iter_mut()
      .flat_map(|l| l.remove_stitches_outside_bounds(bounds))
      .collect()
  }

  /// Reindexes palette item indexes in all layers, then inserts the restored stitches into the specified layer only.
  pub fn restore_stitches(&mut self, layer_index: usize, stitches: Vec<Stitch>, palindexes: &[u32], palsize: u32) {
    // Reindex palindexes in every layer except the target.
    for (i, layer) in self.layers.iter_mut().enumerate() {
      if i == layer_index {
        continue;
      }

      layer.reindex_palindexes(palindexes, palsize);
    }

    // Reindex + insert in one step for the target layer.
    self.layers[layer_index].restore_stitches(stitches, palindexes, palsize);
  }

  /// Adds a layer and returns its index.
  pub fn add_layer(&mut self, layer: Layer) -> usize {
    self.layers.push(layer);
    self.layers.len() - 1
  }

  /// Removes and returns the layer at the given index.
  pub fn remove_layer(&mut self, layer_index: usize) -> Layer {
    assert!(self.layers.len() > 1, "cannot remove the last layer");
    self.layers.remove(layer_index)
  }

  /// Moves the layer at `from` to position `to`.
  pub fn move_layer(&mut self, from: usize, to: usize) {
    let layer = self.layers.remove(from);
    self.layers.insert(to, layer);
  }

  /// Returns the number of layers in the pattern.
  #[must_use]
  pub const fn layers_count(&self) -> usize {
    self.layers.len()
  }

  /// Flattens all visible layers into a single layer, resolving stitch conflicts.
  #[must_use]
  pub fn flatten_visible_layers(&self) -> Layer {
    let mut result = Layer::new("Flattened");
    // Bottom-to-top: higher layers (lower indices) override lower ones via `add_stitch` conflict resolution.
    for layer in self.layers.iter().rev() {
      if !layer.visible {
        continue;
      }

      for &stitch in layer.fullstitches.iter() {
        let visible = match stitch.kind {
          FullStitchKind::Full => layer.fullstitches_visible,
          FullStitchKind::Petite => layer.petitestitches_visible,
        };
        if visible {
          result.add_stitch(Stitch::Full(stitch));
        }
      }

      for &stitch in layer.partstitches.iter() {
        let visible = match stitch.kind {
          PartStitchKind::Half => layer.halfstitches_visible,
          PartStitchKind::Quarter => layer.quarterstitches_visible,
        };
        if visible {
          result.add_stitch(Stitch::Part(stitch));
        }
      }

      for &stitch in layer.linestitches.iter() {
        let visible = match stitch.kind {
          LineStitchKind::Back => layer.backstitches_visible,
          LineStitchKind::Straight => layer.straightstitches_visible,
        };
        if visible {
          result.add_stitch(Stitch::Line(stitch));
        }
      }

      for &stitch in layer.nodestitches.iter() {
        let visible = match stitch.kind {
          NodeStitchKind::FrenchKnot => layer.frenchknots_visible,
          NodeStitchKind::Bead => layer.beads_visible,
        };
        if visible {
          result.add_stitch(Stitch::Node(stitch));
        }
      }

      if layer.specialstitches_visible {
        for &stitch in layer.specialstitches.iter() {
          result.specialstitches.insert(stitch);
        }
      }
    }
    result
  }
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct PatternInfo {
  pub title: String,
  pub author: String,
  pub copyright: String,
  pub description: String,
}

impl Default for PatternInfo {
  fn default() -> Self {
    Self {
      title: String::from("Untitled"),
      author: String::new(),
      copyright: String::new(),
      description: String::new(),
    }
  }
}

impl From<pmaker::PatternInfo> for PatternInfo {
  fn from(pattern_info: pmaker::PatternInfo) -> Self {
    Self {
      title: pattern_info.title,
      author: pattern_info.author,
      copyright: pattern_info.copyright,
      description: pattern_info.description,
    }
  }
}

pub type StitchesPerInch = (u8, u8);

#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct Fabric {
  pub width: u16,
  pub height: u16,
  pub spi: StitchesPerInch,
  pub kind: String,
  pub name: String,
  pub color: String,
}

impl Fabric {
  pub const DEFAULT_WIDTH: u16 = 100;
  pub const DEFAULT_HEIGHT: u16 = 100;
  pub const DEFAULT_SPI: u8 = 14;
  pub const DEFAULT_KIND: &'static str = "Aida";
  pub const DEFAULT_NAME: &'static str = "White";
  pub const DEFAULT_COLOR: &'static str = "FFFFFF";
}

impl Default for Fabric {
  fn default() -> Self {
    Self {
      width: Self::DEFAULT_WIDTH,
      height: Self::DEFAULT_HEIGHT,
      spi: (Self::DEFAULT_SPI, Self::DEFAULT_SPI),
      kind: String::from(Self::DEFAULT_KIND),
      name: String::from(Self::DEFAULT_NAME),
      color: String::from(Self::DEFAULT_COLOR),
    }
  }
}

impl From<pmaker::Fabric> for Fabric {
  fn from(fabric: pmaker::Fabric) -> Self {
    Self {
      width: fabric.width,
      height: fabric.height,
      spi: fabric.stitches_per_inch,
      kind: fabric.kind,
      name: fabric.name,
      color: fabric.color,
    }
  }
}

/// Represents a fabric color item.
#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct FabricColor {
  pub name: String,
  pub color: String,
}
