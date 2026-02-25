use xsp_parsers::pmaker;

use super::palette::*;
use super::stitches::*;

#[derive(Debug, Default, Clone)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct Pattern {
  pub info: PatternInfo,
  pub fabric: Fabric,
  pub palette: Palette,
  pub fullstitches: Stitches<FullStitch>,
  pub partstitches: Stitches<PartStitch>,
  pub linestitches: Stitches<LineStitch>,
  pub nodestitches: Stitches<NodeStitch>,
  pub specialstitches: Stitches<SpecialStitch>,
  pub special_stitch_models: Vec<SpecialStitchModel>,
}

impl Pattern {
  #[must_use]
  pub fn new(fabric: Fabric) -> Self {
    Self {
      fabric,
      ..Self::default()
    }
  }

  /// Returns the number of full and petite stitches in the pattern.
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

  /// Returns the number of half and quarter stitches in the pattern.
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

  /// Returns the number of back and straight stitches in the pattern.
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

  /// Returns the number of french knots and beads in the pattern.
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

  /// Get a stitch from the pattern.
  #[must_use]
  pub fn get_stitch(&self, stitch: &Stitch) -> Option<Stitch> {
    // This method accepts a reference stitch which may not contain all the stitch properties.
    // We use this method to find the actual stitch.

    match stitch {
      Stitch::Full(fullstitch) => {
        if let Some(&fullstitch) = self.fullstitches.get(fullstitch) {
          Some(Stitch::Full(fullstitch))
        } else {
          None
        }
      }
      Stitch::Part(partstitch) => {
        if let Some(&partstitch) = self.partstitches.get(partstitch) {
          Some(Stitch::Part(partstitch))
        } else {
          None
        }
      }
      Stitch::Node(node) => {
        if let Some(&node) = self.nodestitches.get(node) {
          Some(Stitch::Node(node))
        } else {
          None
        }
      }
      Stitch::Line(line) => {
        if let Some(&line) = self.linestitches.get(line) {
          Some(Stitch::Line(line))
        } else {
          None
        }
      }
    }
  }

  /// Check if the pattern contains a stitch.
  #[must_use]
  pub fn contains_stitch(&self, stitch: &Stitch) -> bool {
    match stitch {
      Stitch::Full(fullstitch) => self.fullstitches.contains(fullstitch),
      Stitch::Part(partstitch) => self.partstitches.contains(partstitch),
      Stitch::Node(node) => self.nodestitches.contains(node),
      Stitch::Line(line) => self.linestitches.contains(line),
    }
  }

  /// Adds many stitches to the pattern.
  pub fn add_stitches(&mut self, stitches: Vec<Stitch>) {
    for stitch in stitches {
      self.add_stitch(stitch);
    }
  }

  /// Adds a stitch to the pattern and returns any conflicts that may have arisen.
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

  /// Removes many stitches from the pattern.
  pub fn remove_stitches(&mut self, stitches: Vec<Stitch>) {
    for stitch in stitches {
      self.remove_stitch(stitch);
    }
  }

  /// Removes and returns a stitch from the pattern.
  pub fn remove_stitch(&mut self, stitch: Stitch) -> Option<Stitch> {
    match stitch {
      Stitch::Full(fullstitch) => self.fullstitches.remove(&fullstitch).map(Into::into),
      Stitch::Part(partstitch) => self.partstitches.remove(&partstitch).map(Into::into),
      Stitch::Node(node) => self.nodestitches.remove(&node).map(Into::into),
      Stitch::Line(line) => self.linestitches.remove(&line).map(Into::into),
    }
  }

  /// Removes and returns all stitches with a given palette index from the pattern.
  pub fn remove_stitches_by_palindexes(&mut self, palindexes: &[u32]) -> Vec<Stitch> {
    let mut conflicts = Vec::new();
    conflicts.extend(
      self
        .fullstitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Full),
    );
    conflicts.extend(
      self
        .partstitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Part),
    );
    conflicts.extend(
      self
        .linestitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Line),
    );
    conflicts.extend(
      self
        .nodestitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Node),
    );
    conflicts
  }

  /// Removes all stitches that are outside the bounds of the pattern.
  pub fn remove_stitches_outside_bounds(&mut self, bounds: Bounds) -> Vec<Stitch> {
    let mut conflicts = Vec::new();
    conflicts.extend(
      self
        .fullstitches
        .remove_stitches_outside_bounds(bounds)
        .into_iter()
        .map(Stitch::Full),
    );
    conflicts.extend(
      self
        .partstitches
        .remove_stitches_outside_bounds(bounds)
        .into_iter()
        .map(Stitch::Part),
    );
    conflicts.extend(
      self
        .linestitches
        .remove_stitches_outside_bounds(bounds)
        .into_iter()
        .map(Stitch::Line),
    );
    conflicts.extend(
      self
        .nodestitches
        .remove_stitches_outside_bounds(bounds)
        .into_iter()
        .map(Stitch::Node),
    );
    conflicts
  }

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

#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
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
