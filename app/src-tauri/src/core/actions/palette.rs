use std::sync::OnceLock;

use anyhow::Result;
use embroiderly_pattern::{PaletteItem, PaletteSettings, PatternProject, Stitch, Symbol};
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::utils::base64;

#[cfg(test)]
#[path = "palette.test.rs"]
mod tests;

/// Specifies how palette items should be sorted.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub enum SortPaletteBy {
  /// Sort by brand and number alphanumerically.
  BrandAndNumber,
}

#[derive(Clone)]
pub struct AddPaletteItemAction {
  palitem: PaletteItem,
}

impl AddPaletteItemAction {
  pub const fn new(palitem: PaletteItem) -> Self {
    Self { palitem }
  }
}

impl<R: tauri::Runtime> Action<R> for AddPaletteItemAction {
  /// Add the palette item to the pattern.
  ///
  /// **Emits:**
  /// - `palette:add_palette_item` with the added palette item and its related types.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    patproj.pattern.palette.push(self.palitem.clone());
    window.emit(
      "palette:add_palette_item",
      base64::encode(borsh::to_vec(&AddedPaletteItemData {
        palitem: self.palitem.clone(),
        palindex: (patproj.pattern.palette.len() - 1) as u32,
      })?),
    )?;
    Ok(())
  }

  /// Remove the added palette item from the pattern.
  ///
  /// **Emits:**
  /// - `palette:remove_palette_item` with the palette item index.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    patproj.pattern.palette.pop();
    window.emit("palette:remove_palette_item", [patproj.pattern.palette.len()])?;
    Ok(())
  }
}

#[derive(Clone)]
pub struct RemovePaletteItemsAction {
  palindexes: Vec<u32>,
  metadata: OnceLock<RemovePaletteItemActionMetadata>,
}

#[derive(Debug, Clone)]
struct RemovePaletteItemActionMetadata {
  palitems: Vec<PaletteItem>,
  conflicts: Vec<Stitch>,
}

impl RemovePaletteItemsAction {
  pub fn new(palindexes: Vec<u32>) -> Self {
    let mut palindexes = palindexes;
    palindexes.sort_unstable();
    Self {
      palindexes,
      metadata: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for RemovePaletteItemsAction {
  /// Remove the palette item from the pattern.
  ///
  /// **Emits:**
  /// - `palette:remove_palette_item` with the palette item index.
  /// - `stitches:remove` with the stitches that should be removed.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let mut palitems = Vec::with_capacity(self.palindexes.len());
    for &palindex in self.palindexes.iter().rev() {
      palitems.push(patproj.pattern.palette.remove(palindex));
    }
    window.emit("palette:remove_palette_item", &self.palindexes)?;

    // Reverse the vectors to restore the in the order of `palindexes`.
    palitems.reverse();

    let conflicts = patproj.pattern.remove_stitches_by_palindexes(&self.palindexes);
    window.emit("stitches:remove", base64::encode(borsh::to_vec(&conflicts)?))?;

    if self.metadata.get().is_none() {
      self
        .metadata
        .set(RemovePaletteItemActionMetadata { palitems, conflicts })
        .unwrap();
    }

    Ok(())
  }

  /// Add the removed palette item back to the pattern.
  ///
  /// **Emits:**
  /// - `palette:add_palette_item` with the added palette item and its related types.
  /// - `stitches:add` with the stitches that should be restored.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let metadata = self.metadata.get().unwrap();
    for (index, &palindex) in self.palindexes.iter().enumerate() {
      let palitem = metadata.palitems.get(index).unwrap().clone();
      patproj.pattern.palette.insert(palindex, palitem.clone());

      window.emit(
        "palette:add_palette_item",
        base64::encode(borsh::to_vec(&AddedPaletteItemData { palitem, palindex })?),
      )?;
    }

    patproj.pattern.restore_stitches(
      metadata.conflicts.clone(),
      &self.palindexes,
      patproj.pattern.palette.len() as u32,
    );
    window.emit("stitches:add", base64::encode(borsh::to_vec(&metadata.conflicts)?))?;

    Ok(())
  }
}

#[derive(Debug, Clone, borsh::BorshSerialize)]
#[cfg_attr(test, derive(PartialEq, borsh::BorshDeserialize))]
struct AddedPaletteItemData {
  palitem: PaletteItem,
  palindex: u32,
}

#[derive(Clone)]
pub struct UpdatePaletteDisplaySettingsAction {
  settings: PaletteSettings,
  old_settings: OnceLock<PaletteSettings>,
}

impl UpdatePaletteDisplaySettingsAction {
  pub const fn new(settings: PaletteSettings) -> Self {
    Self {
      settings,
      old_settings: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for UpdatePaletteDisplaySettingsAction {
  /// Update the display settings of the palette.
  ///
  /// **Emits:**
  /// - `palette:update_display_settings` with the new display settings.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    window.emit(
      "palette:update_display_settings",
      base64::encode(borsh::to_vec(&self.settings)?),
    )?;
    let old_settings = std::mem::replace(&mut patproj.display_settings.palette_settings, self.settings);
    if self.old_settings.get().is_none() {
      self.old_settings.set(old_settings).unwrap();
    }
    Ok(())
  }

  /// Revert the display settings of the palette.
  ///
  /// **Emits:**
  /// - `palette:update_display_settings` with the old display settings.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_settings = self.old_settings.get().unwrap();
    window.emit(
      "palette:update_display_settings",
      base64::encode(borsh::to_vec(&old_settings)?),
    )?;
    patproj.display_settings.palette_settings = *old_settings;
    Ok(())
  }
}

#[derive(Clone)]
pub struct SortPaletteAction {
  sort_by: SortPaletteBy,
  old_positions: OnceLock<Vec<u32>>,
}

impl SortPaletteAction {
  pub const fn new(sort_by: SortPaletteBy) -> Self {
    Self {
      sort_by,
      old_positions: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for SortPaletteAction {
  /// Sort the palette items.
  ///
  /// **Emits:**
  /// - `palette:sort` with the new positions array.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    // Save old positions if not already saved.
    if self.old_positions.get().is_none() {
      self
        .old_positions
        .set(patproj.pattern.palette.positions().to_vec())
        .unwrap();
    }

    // Sort based on the specified method.
    let new_positions = match self.sort_by {
      SortPaletteBy::BrandAndNumber => patproj.pattern.palette.sort_by_brand_and_number(),
    };

    window.emit("palette:sort", new_positions)?;
    Ok(())
  }

  /// Restore the previous palette order.
  ///
  /// **Emits:**
  /// - `palette:sort` with the old positions array.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_positions = self.old_positions.get().unwrap().clone();
    patproj.pattern.palette.set_positions(old_positions.clone());
    window.emit("palette:sort", old_positions)?;
    Ok(())
  }
}

#[derive(Clone)]
pub struct ReorderPaletteItemsAction {
  old_position: u32,
  new_position: u32,
  old_positions: OnceLock<Vec<u32>>,
}

impl ReorderPaletteItemsAction {
  pub const fn new(old_position: u32, new_position: u32) -> Self {
    Self {
      old_position,
      new_position,
      old_positions: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for ReorderPaletteItemsAction {
  /// Reorder a palette item from one position to another.
  ///
  /// **Emits:**
  /// - `palette:reorder` with the new positions array.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    if self.old_positions.get().is_none() {
      self
        .old_positions
        .set(patproj.pattern.palette.positions().to_vec())
        .unwrap();
    }

    let new_positions = patproj
      .pattern
      .palette
      .reorder_palette_items(self.old_position, self.new_position);

    window.emit("palette:reorder", new_positions)?;
    Ok(())
  }

  /// Restore the previous palette order.
  ///
  /// **Emits:**
  /// - `palette:reorder` with the old positions array.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_positions = self.old_positions.get().unwrap().clone();
    patproj.pattern.palette.set_positions(old_positions.clone());
    window.emit("palette:reorder", old_positions)?;
    Ok(())
  }
}

#[derive(Clone)]
pub struct SetSymbolAction {
  palindex: u32,
  symbol: Option<Symbol>,
  old_symbol: OnceLock<Option<Symbol>>,
}

impl SetSymbolAction {
  pub const fn new(palindex: u32, symbol: Option<Symbol>) -> Self {
    Self {
      palindex,
      symbol,
      old_symbol: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for SetSymbolAction {
  /// Set or unset the symbol for a palette item.
  ///
  /// **Emits:**
  /// - `palette:set_symbol` with the palette item index and symbol data.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    if self.old_symbol.get().is_none() {
      let old_symbol = patproj
        .pattern
        .palette
        .get(self.palindex)
        .and_then(|item| item.symbol.clone());
      self.old_symbol.set(old_symbol).unwrap();
    }

    if let Some(palitem) = patproj.pattern.palette.get_mut(self.palindex) {
      palitem.symbol.clone_from(&self.symbol);
    }

    window.emit(
      "palette:set_symbol",
      base64::encode(borsh::to_vec(&SetSymbolData {
        palindex: self.palindex,
        symbol: self.symbol.clone(),
      })?),
    )?;

    Ok(())
  }

  /// Restore the previous symbol state.
  ///
  /// **Emits:**
  /// - `palette:set_symbol` with the old symbol data.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_symbol = self.old_symbol.get().unwrap();

    if let Some(palitem) = patproj.pattern.palette.get_mut(self.palindex) {
      palitem.symbol.clone_from(old_symbol);
    }

    window.emit(
      "palette:set_symbol",
      base64::encode(borsh::to_vec(&SetSymbolData {
        palindex: self.palindex,
        symbol: old_symbol.clone(),
      })?),
    )?;

    Ok(())
  }
}

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub struct SetSymbolData {
  pub palindex: u32,
  pub symbol: Option<Symbol>,
}
