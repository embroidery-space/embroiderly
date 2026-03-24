use super::stitches::*;

#[cfg(test)]
#[path = "./layer.test.rs"]
mod tests;

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
    removed
  }

  /// Removes all stitches that are outside the bounds.
  pub fn remove_stitches_outside_bounds(&mut self, bounds: Bounds) -> Vec<Stitch> {
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
    removed
  }

  /// Reindexes the palette item indexes of all stitches in this layer.
  pub fn reindex_palindexes(&mut self, palindexes: &[u32], palsize: u32) {
    self.fullstitches.reindex_palindexes(palindexes, palsize);
    self.partstitches.reindex_palindexes(palindexes, palsize);
    self.linestitches.reindex_palindexes(palindexes, palsize);
    self.nodestitches.reindex_palindexes(palindexes, palsize);
  }

  /// Restores the given stitches into the layer.
  pub fn restore_stitches(&mut self, stitches: Vec<Stitch>, palindexes: &[u32], palsize: u32) {
    let mut fullstitches = Vec::new();
    let mut partstitches = Vec::new();
    let mut linestitches = Vec::new();
    let mut nodestitches = Vec::new();
    for stitch in stitches {
      match stitch {
        Stitch::Full(fullstitch) => fullstitches.push(fullstitch),
        Stitch::Part(partstitch) => partstitches.push(partstitch),
        Stitch::Line(line) => linestitches.push(line),
        Stitch::Node(node) => nodestitches.push(node),
      }
    }

    self.fullstitches.restore_stitches(fullstitches, palindexes, palsize);
    self.partstitches.restore_stitches(partstitches, palindexes, palsize);
    self.linestitches.restore_stitches(linestitches, palindexes, palsize);
    self.nodestitches.restore_stitches(nodestitches, palindexes, palsize);
  }
}
