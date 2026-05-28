//! Layer management for cross-stitch patterns.
//!
//! # Layer Types
//!
//! The module distinguishes between two types of layers:
//!
//! - **Custom Layer** (or simply _layer_ when context is clear): A [`Layer`] object created and managed by the user.
//!   Users can add, remove, rename, reorder, and toggle the visibility of custom layers.
//!   Each custom layer holds its own collections of stitches, effectively acting as an independent drawing canvas.
//!
//! - **Stitch Layer**: A fixed sublayer within a custom layer, representing a specific stitch kind
//!   (e.g., Full Stitches, Half Stitches, Back Stitches).
//!   Stitch layers have a strict, predefined display order (top to bottom as defined in code) that users cannot change.
//!   Users can only toggle the visibility of stitch layers — they cannot create, remove, or reorder them.
//!
//! # Ordering Terminology
//!
//! This module uses specific terminology to distinguish between storage and display order for custom layers:
//!
//! - **Index** (or _actual index_): The stable position of a layer in internal storage.
//!   Layer indexes never change when layers are reordered visually, ensuring that all references to a layer remain valid.
//!
//! - **Position** (or _visual position_): The display order of custom layers in the UI.
//!   Users can freely reorder layers by changing positions without affecting the underlying stable indexes.
//!
//! ## Example
//!
//! ```text
//! items:     [Default, Layer2, Layer3]  <- Actual storage (stable indexes: 0, 1, 2)
//! positions: [2, 1, 0]                  <- Visual order: Layer3, Layer2, Default
//! ```
//!
//! In this example:
//! - A layer with index 0 always refers to Default, regardless of visual order.
//! - The UI displays layers as: Layer3 (index 2), Layer2 (index 1), Default (index 0).

use super::stitches::*;

#[cfg(test)]
#[path = "./layers.test.rs"]
mod tests;

/// Manages custom layers and their visual ordering.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct Layers {
  /// The actual layers.
  items: Vec<Layer>,
  /// Visual ordering of layers.
  positions: Vec<u32>,
}

impl Layers {
  /// Creates a new empty layers collection.
  #[must_use]
  pub const fn new() -> Self {
    Self {
      items: vec![],
      positions: vec![],
    }
  }

  /// Creates a new layers collection with the given layer.
  #[must_use]
  pub fn new_with_layer(layer: Layer) -> Self {
    Self {
      items: vec![layer],
      positions: vec![0],
    }
  }

  // === Access Methods ===

  /// Returns the number of layers.
  #[must_use]
  pub fn len(&self) -> usize {
    debug_assert_eq!(self.items.len(), self.positions.len());
    self.items.len()
  }

  /// Returns `true` if there are no layers.
  #[must_use]
  pub fn is_empty(&self) -> bool {
    debug_assert_eq!(self.items.is_empty(), self.positions.is_empty());
    self.items.is_empty()
  }

  /// Returns a reference to a layer by its actual index.
  #[must_use]
  pub fn get(&self, index: u32) -> Option<&Layer> {
    self.items.get(index as usize)
  }

  /// Returns a mutable reference to a layer by its actual index.
  pub fn get_mut(&mut self, index: u32) -> Option<&mut Layer> {
    self.items.get_mut(index as usize)
  }

  // === Iteration Methods ===

  /// Returns an iterator over layers in actual order.
  pub fn iter(&self) -> impl Iterator<Item = &Layer> {
    self.items.iter()
  }

  /// Returns a mutable iterator over layers in actual order.
  pub fn iter_mut(&mut self) -> impl Iterator<Item = &mut Layer> {
    self.items.iter_mut()
  }

  // === Mutation Methods ===

  /// Adds a new layer, returning its actual index.
  /// The layer appears at visual position 0 (top).
  pub fn push(&mut self, layer: Layer) -> u32 {
    let index = self.items.len() as u32;
    self.items.push(layer);
    self.positions.insert(0, index);
    index
  }

  /// Inserts a layer at a specific actual index.
  /// Updates positions accordingly.
  pub fn insert(&mut self, index: u32, layer: Layer) {
    self.items.insert(index as usize, layer);

    // Shift all positions which reference indexes >= index.
    for pos in self.positions.iter_mut() {
      if *pos >= index {
        *pos += 1;
      }
    }

    // Find the correct visual position for this index (maintain sorted visual order for new entries).
    let position = self
      .positions
      .iter()
      .position(|&idx| idx > index)
      .unwrap_or(self.positions.len());
    self.positions.insert(position, index);
  }

  /// Removes a layer by its actual index, returning the removed layer.
  pub fn remove(&mut self, index: u32) -> Layer {
    assert!(self.items.len() > 1, "cannot remove the last layer");

    // Remove from items.
    let removed = self.items.remove(index as usize);

    // Remove from positions.
    self.positions.retain(|&idx| idx != index);

    // Shift all positions which reference indexes > index.
    for pos in self.positions.iter_mut() {
      if *pos > index {
        *pos -= 1;
      }
    }

    removed
  }

  // === Ordering Methods ===

  /// Returns the current visual positions.
  #[must_use]
  pub fn positions(&self) -> &[u32] {
    &self.positions
  }

  /// Sets the visual positions.
  pub fn set_positions(&mut self, positions: Vec<u32>) {
    debug_assert_eq!(positions.len(), self.items.len());
    self.positions = positions;
  }

  /// Moves the layer at `old_position` to `new_position` in visual order.
  /// Returns the updated positions array.
  pub fn move_layer(&mut self, old_position: u32, new_position: u32) -> Vec<u32> {
    debug_assert!((old_position as usize) < self.positions.len());
    debug_assert!((new_position as usize) < self.positions.len());

    if old_position == new_position {
      return self.positions.clone();
    }

    let item_index = self.positions.remove(old_position as usize);
    self.positions.insert(new_position as usize, item_index);

    self.positions.clone()
  }
}

impl Default for Layers {
  fn default() -> Self {
    Self::new_with_layer(Layer::default())
  }
}

impl From<Vec<Layer>> for Layers {
  fn from(items: Vec<Layer>) -> Self {
    let positions = (0..items.len() as u32).collect();
    Self { items, positions }
  }
}

impl std::ops::Index<u32> for Layers {
  type Output = Layer;

  fn index(&self, index: u32) -> &Self::Output {
    &self.items[index as usize]
  }
}

impl std::ops::IndexMut<u32> for Layers {
  fn index_mut(&mut self, index: u32) -> &mut Self::Output {
    &mut self.items[index as usize]
  }
}

#[cfg(feature = "serde")]
impl serde::Serialize for Layers {
  fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
    self.items.serialize(serializer)
  }
}

#[cfg(feature = "serde")]
impl<'de> serde::Deserialize<'de> for Layers {
  fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
    let items = Vec::<Layer>::deserialize(deserializer)?;
    Ok(Self::from(items))
  }
}

/// Represent a _custom_ layer.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct Layer {
  pub name: String,
  pub visible: bool,

  pub fullstitches: Stitches<FullStitch>,
  pub fullstitches_visible: bool,
  pub petitestitches_visible: bool,

  pub partstitches: Stitches<PartStitch>,
  pub halfstitches_visible: bool,
  pub quarterstitches_visible: bool,

  pub linestitches: Stitches<LineStitch>,
  pub backstitches_visible: bool,
  pub straightstitches_visible: bool,

  pub nodestitches: Stitches<NodeStitch>,
  pub frenchknots_visible: bool,
  pub beads_visible: bool,

  pub specialstitches: Stitches<SpecialStitch>,
  pub specialstitches_visible: bool,
}

impl Default for Layer {
  fn default() -> Self {
    Self {
      name: String::new(),
      visible: true,

      fullstitches: Stitches::new(),
      fullstitches_visible: true,
      petitestitches_visible: true,

      partstitches: Stitches::new(),
      halfstitches_visible: true,
      quarterstitches_visible: true,

      linestitches: Stitches::new(),
      backstitches_visible: true,
      straightstitches_visible: true,

      nodestitches: Stitches::new(),
      frenchknots_visible: true,
      beads_visible: true,

      specialstitches: Stitches::new(),
      specialstitches_visible: true,
    }
  }
}

impl Layer {
  /// Creates a new layer with the given name.
  pub fn new(name: impl ToString) -> Self {
    Self {
      name: name.to_string(),
      ..Self::default()
    }
  }

  /// Returns the number of full and petite stitches in the layer.
  #[must_use]
  pub fn full_stitches_number(&self) -> (usize, usize) {
    let mut full = 0;
    let mut petite = 0;
    for stitch in self.fullstitches.iter() {
      match stitch.kind {
        FullStitchKind::Full => full += 1,
        FullStitchKind::Petite => petite += 1,
      }
    }
    (full, petite)
  }

  /// Returns the number of half and quarter stitches in the layer.
  #[must_use]
  pub fn part_stitches_number(&self) -> (usize, usize) {
    let mut half = 0;
    let mut quarter = 0;
    for stitch in self.partstitches.iter() {
      match stitch.kind {
        PartStitchKind::Half => half += 1,
        PartStitchKind::Quarter => quarter += 1,
      }
    }
    (half, quarter)
  }

  /// Returns the number of back and straight stitches in the layer.
  #[must_use]
  pub fn line_stitches_number(&self) -> (usize, usize) {
    let mut back = 0;
    let mut straight = 0;
    for stitch in self.linestitches.iter() {
      match stitch.kind {
        LineStitchKind::Back => back += 1,
        LineStitchKind::Straight => straight += 1,
      }
    }
    (back, straight)
  }

  /// Returns the number of french knots and beads in the layer.
  #[must_use]
  pub fn node_stitches_number(&self) -> (usize, usize) {
    let mut knot = 0;
    let mut bead = 0;
    for stitch in self.nodestitches.iter() {
      match stitch.kind {
        NodeStitchKind::FrenchKnot => knot += 1,
        NodeStitchKind::Bead => bead += 1,
      }
    }
    (knot, bead)
  }

  /// Get a stitch from the layer.
  #[must_use]
  pub fn get_stitch(&self, stitch: &Stitch) -> Option<Stitch> {
    match stitch {
      Stitch::Full(fullstitch) => self.fullstitches.get(fullstitch).copied().map(Stitch::Full),
      Stitch::Part(partstitch) => self.partstitches.get(partstitch).copied().map(Stitch::Part),
      Stitch::Node(node) => self.nodestitches.get(node).copied().map(Stitch::Node),
      Stitch::Line(line) => self.linestitches.get(line).copied().map(Stitch::Line),
      Stitch::Special(special) => self.specialstitches.get(special).copied().map(Stitch::Special),
    }
  }

  /// Check if the layer contains a stitch.
  #[must_use]
  pub fn contains_stitch(&self, stitch: &Stitch) -> bool {
    match stitch {
      Stitch::Full(fullstitch) => self.fullstitches.contains(fullstitch),
      Stitch::Part(partstitch) => self.partstitches.contains(partstitch),
      Stitch::Node(node) => self.nodestitches.contains(node),
      Stitch::Line(line) => self.linestitches.contains(line),
      Stitch::Special(special) => self.specialstitches.contains(special),
    }
  }

  /// Adds many stitches to the layer.
  pub fn add_stitches(&mut self, stitches: Vec<Stitch>) {
    for stitch in stitches {
      self.add_stitch(stitch);
    }
  }

  /// Adds a stitch to the layer and returns any conflicts that may have arisen.
  pub fn add_stitch(&mut self, stitch: Stitch) -> Vec<Stitch> {
    let mut conflicts = Vec::new();
    match stitch {
      Stitch::Full(fullstitch) => {
        match fullstitch.kind {
          FullStitchKind::Full => {
            conflicts.extend(
              self
                .fullstitches
                .remove_conflicts_with_full_stitch(&fullstitch)
                .into_iter()
                .map(Stitch::Full),
            );
            conflicts.extend(
              self
                .partstitches
                .remove_conflicts_with_full_stitch(&fullstitch)
                .into_iter()
                .map(Stitch::Part),
            );
          }
          FullStitchKind::Petite => {
            conflicts.extend(
              self
                .fullstitches
                .remove_conflicts_with_petite_stitch(&fullstitch)
                .into_iter()
                .map(Stitch::Full),
            );
            conflicts.extend(
              self
                .partstitches
                .remove_conflicts_with_petite_stitch(&fullstitch)
                .into_iter()
                .map(Stitch::Part),
            );
          }
        }
        if let Some(fullstitch) = self.fullstitches.insert(fullstitch) {
          conflicts.push(Stitch::Full(fullstitch));
        }
      }
      Stitch::Part(partstitch) => {
        match partstitch.kind {
          PartStitchKind::Half => {
            conflicts.extend(
              self
                .fullstitches
                .remove_conflicts_with_half_stitch(&partstitch)
                .into_iter()
                .map(Stitch::Full),
            );
            conflicts.extend(
              self
                .partstitches
                .remove_conflicts_with_half_stitch(&partstitch)
                .into_iter()
                .map(Stitch::Part),
            );
          }
          PartStitchKind::Quarter => {
            conflicts.extend(
              self
                .fullstitches
                .remove_conflicts_with_quarter_stitch(&partstitch)
                .into_iter()
                .map(Stitch::Full),
            );
            conflicts.extend(
              self
                .partstitches
                .remove_conflicts_with_quarter_stitch(&partstitch)
                .into_iter()
                .map(Stitch::Part),
            );
          }
        }
        if let Some(partstitch) = self.partstitches.insert(partstitch) {
          conflicts.push(Stitch::Part(partstitch));
        }
      }
      Stitch::Node(node) => {
        if let Some(node) = self.nodestitches.insert(node) {
          conflicts.push(Stitch::Node(node));
        }
      }
      Stitch::Line(line) => {
        if let Some(line) = self.linestitches.insert(line) {
          conflicts.push(Stitch::Line(line));
        }
      }
      Stitch::Special(special) => {
        if let Some(special) = self.specialstitches.insert(special) {
          conflicts.push(Stitch::Special(special));
        }
      }
    }
    conflicts
  }

  /// Removes many stitches from the layer.
  pub fn remove_stitches(&mut self, stitches: Vec<Stitch>) {
    for stitch in stitches {
      self.remove_stitch(stitch);
    }
  }

  /// Removes and returns a stitch from the layer.
  pub fn remove_stitch(&mut self, stitch: Stitch) -> Option<Stitch> {
    match stitch {
      Stitch::Full(fullstitch) => self.fullstitches.remove(&fullstitch).map(Into::into),
      Stitch::Part(partstitch) => self.partstitches.remove(&partstitch).map(Into::into),
      Stitch::Node(node) => self.nodestitches.remove(&node).map(Into::into),
      Stitch::Line(line) => self.linestitches.remove(&line).map(Into::into),
      Stitch::Special(special) => self.specialstitches.remove(&special).map(Into::into),
    }
  }

  /// Removes and returns all stitches with a given palette index from the layer.
  pub fn remove_stitches_by_palindexes(&mut self, palindexes: &[u32]) -> Vec<Stitch> {
    let mut removed = Vec::new();
    removed.extend(
      self
        .fullstitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Full),
    );
    removed.extend(
      self
        .partstitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Part),
    );
    removed.extend(
      self
        .linestitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Line),
    );
    removed.extend(
      self
        .nodestitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Node),
    );
    removed.extend(
      self
        .specialstitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Special),
    );
    removed
  }

  /// Removes all stitches that are outside the bounds.
  pub fn remove_stitches_outside_bounds(
    &mut self,
    bounds: Bounds,
    special_stitch_models: &[SpecialStitchModel],
  ) -> Vec<Stitch> {
    let mut removed = Vec::new();
    removed.extend(
      self
        .fullstitches
        .remove_stitches_outside_bounds(bounds)
        .into_iter()
        .map(Stitch::Full),
    );
    removed.extend(
      self
        .partstitches
        .remove_stitches_outside_bounds(bounds)
        .into_iter()
        .map(Stitch::Part),
    );
    removed.extend(
      self
        .linestitches
        .remove_stitches_outside_bounds(bounds)
        .into_iter()
        .map(Stitch::Line),
    );
    removed.extend(
      self
        .nodestitches
        .remove_stitches_outside_bounds(bounds)
        .into_iter()
        .map(Stitch::Node),
    );
    removed.extend(
      self
        .specialstitches
        .remove_stitches_outside_bounds(bounds, special_stitch_models)
        .into_iter()
        .map(Stitch::Special),
    );
    removed
  }

  /// Reindexes the palette item indexes of all stitches in this layer.
  pub fn reindex_palindexes(&mut self, palindexes: &[u32], palsize: u32) {
    self.fullstitches.reindex_palindexes(palindexes, palsize);
    self.partstitches.reindex_palindexes(palindexes, palsize);
    self.linestitches.reindex_palindexes(palindexes, palsize);
    self.nodestitches.reindex_palindexes(palindexes, palsize);
    self.specialstitches.reindex_palindexes(palindexes, palsize);
  }

  /// Restores the given stitches into the layer.
  pub fn restore_stitches(&mut self, stitches: Vec<Stitch>, palindexes: &[u32], palsize: u32) {
    let mut fullstitches = Vec::new();
    let mut partstitches = Vec::new();
    let mut linestitches = Vec::new();
    let mut nodestitches = Vec::new();
    let mut specialstitches = Vec::new();
    for stitch in stitches {
      match stitch {
        Stitch::Full(fullstitch) => fullstitches.push(fullstitch),
        Stitch::Part(partstitch) => partstitches.push(partstitch),
        Stitch::Line(line) => linestitches.push(line),
        Stitch::Node(node) => nodestitches.push(node),
        Stitch::Special(special) => specialstitches.push(special),
      }
    }

    self.fullstitches.restore_stitches(fullstitches, palindexes, palsize);
    self.partstitches.restore_stitches(partstitches, palindexes, palsize);
    self.linestitches.restore_stitches(linestitches, palindexes, palsize);
    self.nodestitches.restore_stitches(nodestitches, palindexes, palsize);
    self
      .specialstitches
      .restore_stitches(specialstitches, palindexes, palsize);
  }
}
