use std::sync::OnceLock;

use anyhow::Result;
use embroiderly_pattern::{PaletteItem, PaletteSettings, PatternProject, Stitch};
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::utils::base64;

#[cfg(test)]
#[path = "palette.test.rs"]
mod tests;

#[derive(Clone)]
pub struct AddPaletteItemAction {
  palitem: PaletteItem,
}

impl AddPaletteItemAction {
  pub fn new(palitem: PaletteItem) -> Self {
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
    let mut palindexes = palindexes.clone();
    palindexes.sort();
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
      palitems.push(patproj.pattern.palette.remove(palindex as usize));
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
      patproj.pattern.palette.insert(palindex as usize, palitem.clone());

      window.emit(
        "palette:add_palette_item",
        base64::encode(borsh::to_vec(&AddedPaletteItemData { palindex, palitem })?),
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
  pub fn new(settings: PaletteSettings) -> Self {
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
