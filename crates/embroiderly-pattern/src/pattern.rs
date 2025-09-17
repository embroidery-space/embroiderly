use xsp_parsers::pmaker;

use super::stitches::*;

#[derive(Debug, Default, Clone)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct Pattern {
  pub info: PatternInfo,
  pub fabric: Fabric,
  pub palette: Vec<PaletteItem>,
  pub fullstitches: Stitches<FullStitch>,
  pub partstitches: Stitches<PartStitch>,
  pub linestitches: Stitches<LineStitch>,
  pub nodestitches: Stitches<NodeStitch>,
  pub specialstitches: Stitches<SpecialStitch>,
  pub special_stitch_models: Vec<SpecialStitchModel>,
}

impl Pattern {
  pub fn new(fabric: Fabric) -> Self {
    Pattern { fabric, ..Pattern::default() }
  }

  /// Returns the number of blend colors in the pattern palette.
  pub fn blends_number(&self) -> usize {
    self.palette.iter().filter(|palitem| palitem.is_blend()).count()
  }

  /// Returns the thread brands used in the pattern palette.
  pub fn used_palette_brands(&self) -> Vec<String> {
    self
      .palette
      .iter()
      .map(|palitem| palitem.brand.clone())
      .collect::<std::collections::HashSet<String>>() // Collect unique values only.
      .into_iter()
      .collect() // Convert to vector.
  }

  /// Returns the stitch font names used in the pattern.
  pub fn used_stitch_fonts(&self) -> Vec<String> {
    self
      .palette
      .iter()
      .filter_map(|palitem| palitem.symbol_font.clone())
      .collect::<std::collections::HashSet<String>>() // Collect unique values only.
      .into_iter()
      .collect() // Convert to vector.
  }

  /// Returns the number of full and petite stitches in the pattern.
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
    log::trace!("Adding stitch");
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
        };
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
        };
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
    };
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
    log::trace!("Removing stitch");
    match stitch {
      Stitch::Full(fullstitch) => self.fullstitches.remove(&fullstitch).map(|fs| fs.into()),
      Stitch::Part(partstitch) => self.partstitches.remove(&partstitch).map(|ps| ps.into()),
      Stitch::Node(node) => self.nodestitches.remove(&node).map(|node| node.into()),
      Stitch::Line(line) => self.linestitches.remove(&line).map(|line| line.into()),
    }
  }

  /// Removes and returns all stitches with a given palette index from the pattern.
  pub fn remove_stitches_by_palindexes(&mut self, palindexes: &[u32]) -> Vec<Stitch> {
    log::trace!("Removing stitches by palette index");
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
    log::trace!("Removing stitches outside bounds");
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
    for stitch in stitches.into_iter() {
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

  pub fn get_all_symbol_fonts(&self) -> Vec<String> {
    let mut fonts = std::collections::HashSet::new();
    for item in &self.palette {
      if let Some(symbol_font) = &item.symbol_font {
        fonts.insert(symbol_font.clone());
      }
    }
    fonts.into_iter().collect()
  }
}

#[derive(Debug, Clone, PartialEq)]
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

#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct PaletteItem {
  pub brand: String,
  pub number: String,
  pub name: String,
  pub color: String,
  pub blends: Option<Vec<Blend>>,
  #[cfg_attr(
    feature = "borsh",
    borsh(
      serialize_with = "serialize_option_char",
      deserialize_with = "deserialize_option_char"
    )
  )]
  pub symbol: Option<char>,
  pub symbol_font: Option<String>,
}

impl PaletteItem {
  /// Returns true if the palette item is a blend.
  pub fn is_blend(&self) -> bool {
    self.blends.as_ref().is_some_and(|blends| !blends.is_empty())
  }

  /// Returns a printable representation of the symbol.
  pub fn get_symbol(&self) -> String {
    self.symbol.map(|ch| ch.to_string()).unwrap_or_default()
  }
}

impl From<pmaker::PaletteItem> for PaletteItem {
  fn from(palette_item: pmaker::PaletteItem) -> Self {
    Self {
      brand: palette_item.brand,
      number: palette_item.number,
      name: palette_item.name,
      color: palette_item.color,
      blends: palette_item
        .blends
        .map(|blends| blends.into_iter().map(Blend::from).collect()),
      symbol_font: None,
      symbol: None,
    }
  }
}

#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct Blend {
  pub brand: String,
  pub number: String,
}

impl From<pmaker::Blend> for Blend {
  fn from(blend: pmaker::Blend) -> Self {
    Self {
      brand: blend.brand,
      number: blend.number,
    }
  }
}

#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct Bead {
  pub length: f32,
  pub diameter: f32,
}

impl From<pmaker::Bead> for Bead {
  fn from(bead: pmaker::Bead) -> Self {
    Self {
      length: bead.length,
      diameter: bead.diameter,
    }
  }
}

pub type StitchesPerInch = (u8, u8);

#[derive(Debug, Clone, PartialEq)]
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
      width: Fabric::DEFAULT_WIDTH,
      height: Fabric::DEFAULT_HEIGHT,
      spi: (Fabric::DEFAULT_SPI, Fabric::DEFAULT_SPI),
      kind: String::from(Fabric::DEFAULT_KIND),
      name: String::from(Fabric::DEFAULT_NAME),
      color: String::from(Fabric::DEFAULT_COLOR),
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

#[cfg(feature = "borsh")]
fn serialize_option_char<W: borsh::io::Write>(value: &Option<char>, writer: &mut W) -> borsh::io::Result<()> {
  use borsh::BorshSerialize;

  match value {
    Some(ch) => {
      true.serialize(writer)?;
      (*ch as u32).serialize(writer)
    }
    None => false.serialize(writer),
  }
}

#[cfg(feature = "borsh")]
fn deserialize_option_char<R: borsh::io::Read>(reader: &mut R) -> borsh::io::Result<Option<char>> {
  use borsh::BorshDeserialize;

  let has_value = bool::deserialize_reader(reader)?;
  if has_value {
    let value = u32::deserialize_reader(reader)?;
    Ok(char::from_u32(value))
  } else {
    Ok(None)
  }
}
