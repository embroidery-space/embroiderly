//! Palette management for cross-stitch patterns.
//!
//! # Palette Types
//!
//! The module distinguishes between two types of palettes:
//!
//! - **Working Palette** (or simply _palette_ when context is clear): The palette used in a specific project pattern.
//!   It contains all colors currently in use, with additional project-specific display properties such as symbols and symbol fonts.
//!   It is represented by the [`Palette`] struct containing [`PaletteItem`]s.
//!
//! - **Brand Palette**: A catalog of colors from specific manufacturers (DMC, Anchor, Madeira, etc.) or designers' custom collections (e.g., specific blend sets).
//!   Brand palettes serve as a source from which colors can be added to the working palette.
//!   This is represented by collections of [`BrandPaletteItem`]s.
//!
//! # Ordering Terminology
//!
//! This module uses specific terminology to distinguish between storage and display order:
//!
//! - **Index** (or _actual index_): The stable position of a palette item in the internal storage.
//!   Stitches reference palette items using their indexes, which never change when items are reordered visually.
//!   This ensures stitch references remain valid when users sort or rearrange the palette.
//!
//! - **Position** (or _visual position_): The display order of palette items in the UI.
//!   Users can freely reorder items by changing positions without affecting the underlying indexes that stitches reference.
//!
//! ## Example
//!
//! ```text
//! items:     [Red, Green, Blue]  <- Actual storage (stable indexes: 0, 1, 2)
//! positions: [1, 2, 0]           <- Visual order: Green, Blue, Red
//! ```
//!
//! In this example:
//! - A stitch with `palindex: 0` always refers to Red, regardless of visual order.
//! - The UI displays items as: Green (index 1), Blue (index 2), Red (index 0).

#[cfg(test)]
#[path = "./palette.test.rs"]
mod tests;

use xsp_parsers::{pmaker, ursa, xspro};

/// Manages palette items and their visual ordering.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct Palette {
  /// The actual palette items.
  items: Vec<PaletteItem>,
  /// Visual ordering of palette items.
  positions: Vec<u32>,
}

impl Palette {
  /// Creates a new empty palette.
  pub fn new() -> Self {
    Self {
      items: Vec::new(),
      positions: Vec::new(),
    }
  }

  // === Access Methods ===

  /// Returns the number of palette items.
  pub fn len(&self) -> usize {
    debug_assert_eq!(self.items.len(), self.positions.len(),);
    self.items.len()
  }

  /// Returns `true` if the palette is empty.
  pub fn is_empty(&self) -> bool {
    debug_assert_eq!(self.items.is_empty(), self.positions.is_empty(),);
    self.items.is_empty()
  }

  /// Returns a reference to a palette item by its actual index.
  pub fn get(&self, index: u32) -> Option<&PaletteItem> {
    self.items.get(index as usize)
  }

  /// Returns a mutable reference to a palette item by its actual index.
  pub fn get_mut(&mut self, index: u32) -> Option<&mut PaletteItem> {
    self.items.get_mut(index as usize)
  }

  /// Returns `true` if a palette item exists in the palette.
  pub fn contains(&self, item: &PaletteItem) -> bool {
    self.items.contains(item)
  }

  // === Iteration Methods ===

  /// Returns an iterator over palette items in actual order.
  pub fn iter(&self) -> impl Iterator<Item = &PaletteItem> {
    self.items.iter()
  }

  // === Mutation Methods ===

  /// Adds a new palette item, returning its actual index.
  pub fn push(&mut self, item: PaletteItem) -> u32 {
    let index = self.items.len() as u32;
    self.items.push(item);
    self.positions.push(index);
    index
  }

  /// Inserts a palette item at a specific actual index.
  pub fn insert(&mut self, index: u32, item: PaletteItem) {
    // Insert the item at the actual index.
    self.items.insert(index as usize, item);

    // Update all positions that reference indexes >= index.
    for pos in self.positions.iter_mut() {
      if *pos >= index {
        *pos += 1;
      }
    }

    // Find where index should be inserted in visual order.
    let position = self
      .positions
      .iter()
      .position(|&idx| idx > index)
      .unwrap_or(self.positions.len());
    // Insert the new index at the corresponding visual position.
    self.positions.insert(position, index);
  }

  /// Removes a palette item by its actual index, returning the removed item.
  pub fn remove(&mut self, index: u32) -> PaletteItem {
    // Remove from items.
    let removed = self.items.remove(index as usize);

    // Remove from positions.
    self.positions.retain(|&idx| idx != index);

    // Update all positions that reference indexes > index.
    for pos in self.positions.iter_mut() {
      if *pos > index {
        *pos -= 1;
      }
    }

    removed
  }

  /// Removes the last palette item in actual order.
  pub fn pop(&mut self) -> Option<PaletteItem> {
    // Remove from items.
    let removed = self.items.pop();

    // Remove from positions.
    if removed.is_some() {
      self.positions.retain(|&idx| idx != self.items.len() as u32);
    }

    removed
  }

  // === Ordering Methods ===

  /// Returns the current visual positions.
  pub fn positions(&self) -> &[u32] {
    &self.positions
  }

  /// Sets the visual positions.
  pub fn set_positions(&mut self, positions: Vec<u32>) {
    debug_assert_eq!(positions.len(), self.items.len());
    self.positions = positions;
  }

  /// Sorts palette items by brand and number alphanumerically.
  ///
  /// Returns the new positions array after sorting.
  pub fn sort_by_brand_and_number(&mut self) -> Vec<u32> {
    // Create a vector of (index, sort_key) pairs.
    let mut indexed_items: Vec<(u32, String)> = self
      .items
      .iter()
      .enumerate()
      .map(|(idx, item)| {
        let sort_key = format!("{} {}", item.brand, item.number);
        (idx as u32, sort_key)
      })
      .collect();

    // Sort alphanumerically.
    alphanumeric_sort::sort_slice_by_str_key(&mut indexed_items, |(_, key)| key);

    // Set and return new positions.
    self.positions = indexed_items.iter().map(|(idx, _)| *idx).collect();
    self.positions.clone()
  }

  /// Reorders a palette item from one visual position to another.
  pub fn reorder_palette_items(&mut self, old_position: u32, new_position: u32) -> Vec<u32> {
    debug_assert!((old_position as usize) < self.positions.len());
    debug_assert!((new_position as usize) < self.positions.len());

    if old_position == new_position {
      return self.positions.clone();
    }

    let item_index = self.positions.remove(old_position as usize);
    self.positions.insert(new_position as usize, item_index);

    self.positions.clone()
  }

  // === Utility Methods ===

  /// Returns the number of blend colors in the palette.
  pub fn blends_number(&self) -> usize {
    self.items.iter().filter(|palitem| palitem.is_blend()).count()
  }

  /// Returns the thread brands used in the palette.
  pub fn used_brands(&self) -> Vec<String> {
    self
      .items
      .iter()
      .map(|palitem| palitem.brand.clone())
      .collect::<std::collections::HashSet<String>>() // Collect unique values only.
      .into_iter()
      .collect() // Convert to vector.
  }

  /// Returns the symbol font names used in the palette.
  pub fn used_symbol_fonts(&self) -> Vec<String> {
    self
      .items
      .iter()
      .filter_map(|palitem| palitem.symbol_font.clone())
      .collect::<std::collections::HashSet<String>>() // Collect unique values only.
      .into_iter()
      .collect() // Convert to vector.
  }
}

impl Default for Palette {
  fn default() -> Self {
    Self::new()
  }
}

impl From<Vec<PaletteItem>> for Palette {
  fn from(items: Vec<PaletteItem>) -> Self {
    let positions = (0..items.len() as u32).collect();
    Self { items, positions }
  }
}

impl FromIterator<PaletteItem> for Palette {
  fn from_iter<T: IntoIterator<Item = PaletteItem>>(iter: T) -> Self {
    let items: Vec<PaletteItem> = iter.into_iter().collect();
    Self::from(items)
  }
}

impl AsRef<[PaletteItem]> for Palette {
  fn as_ref(&self) -> &[PaletteItem] {
    &self.items
  }
}

impl AsMut<Vec<PaletteItem>> for Palette {
  fn as_mut(&mut self) -> &mut Vec<PaletteItem> {
    &mut self.items
  }
}

impl From<Palette> for Vec<PaletteItem> {
  fn from(palette: Palette) -> Self {
    palette.items
  }
}

impl std::ops::Index<u32> for Palette {
  type Output = PaletteItem;

  fn index(&self, index: u32) -> &Self::Output {
    &self.items[index as usize]
  }
}

impl std::ops::IndexMut<u32> for Palette {
  fn index_mut(&mut self, index: u32) -> &mut Self::Output {
    &mut self.items[index as usize]
  }
}

/// Represents a _working_ palette item.
///
/// It contains all the properties from [`BrandPaletteItem`] plus project-specific display properties.
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
    if let Some(symbol) = self.symbol {
      // Check if the symbol code is a valid Unicode character.
      // We support only a part of the BMP supported by XML 1.0.
      if matches!(symbol as u32, 0x0020..=0xD7FF | 0xE000..=0xFFFD) {
        symbol.to_string()
      } else {
        char::REPLACEMENT_CHARACTER.to_string()
      }
    } else {
      String::new()
    }
  }
}

impl From<BrandPaletteItem> for PaletteItem {
  fn from(brand_item: BrandPaletteItem) -> Self {
    Self {
      brand: brand_item.brand,
      number: brand_item.number,
      name: brand_item.name,
      color: brand_item.color,
      blends: brand_item.blends,

      symbol: None,
      symbol_font: None,
    }
  }
}

impl From<pmaker::PaletteItem> for PaletteItem {
  fn from(palitem: pmaker::PaletteItem) -> Self {
    Self {
      brand: palitem.brand,
      number: palitem.number,
      name: palitem.name,
      color: palitem.color,
      blends: palitem
        .blends
        .map(|blends| blends.into_iter().map(Blend::from).collect()),
      symbol: None,
      symbol_font: None,
    }
  }
}

impl From<ursa::PaletteItem> for PaletteItem {
  fn from(palitem: ursa::PaletteItem) -> Self {
    Self {
      brand: palitem.brand,
      number: palitem.number,
      name: palitem.name,
      color: palitem.color,
      blends: None,
      symbol: None,
      symbol_font: None,
    }
  }
}

impl From<xspro::PaletteItem> for PaletteItem {
  fn from(palitem: xspro::PaletteItem) -> Self {
    Self {
      brand: palitem.brand,
      number: palitem.number,
      name: palitem.name,
      color: palitem.color,
      blends: None,
      symbol: None,
      symbol_font: None,
    }
  }
}

/// Represents a _brand_ palette item.
///
/// It contains only essential properties for clearly identifying colors from manufacturer catalogs or custom collections.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct BrandPaletteItem {
  pub brand: String,
  pub number: String,
  pub name: String,
  pub color: String,
  #[cfg_attr(feature = "serde", serde(skip_serializing_if = "blends_empty"))]
  pub blends: Option<Vec<Blend>>,
}

impl From<pmaker::PaletteItem> for BrandPaletteItem {
  fn from(palitem: pmaker::PaletteItem) -> Self {
    Self {
      brand: palitem.brand,
      number: palitem.number,
      name: palitem.name,
      color: palitem.color,
      blends: palitem
        .blends
        .map(|blends| blends.into_iter().map(Blend::from).collect()),
    }
  }
}

impl From<ursa::PaletteItem> for BrandPaletteItem {
  fn from(palitem: ursa::PaletteItem) -> Self {
    Self {
      brand: palitem.brand,
      number: palitem.number,
      name: palitem.name,
      color: palitem.color,
      blends: None,
    }
  }
}

impl From<xspro::PaletteItem> for BrandPaletteItem {
  fn from(palitem: xspro::PaletteItem) -> Self {
    Self {
      brand: palitem.brand,
      number: palitem.number,
      name: palitem.name,
      color: palitem.color,
      blends: None,
    }
  }
}

/// Represents a blend component of a palette item.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
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

/// Represents a bead used in patterns.
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

#[cfg(feature = "serde")]
fn blends_empty(blends: &Option<Vec<Blend>>) -> bool {
  blends.as_ref().is_none_or(|blends| blends.is_empty())
}
