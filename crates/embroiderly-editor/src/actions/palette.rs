use embroiderly_pattern::{EmbroiderlyProject, PaletteItem, PaletteSettings, Stitch, Symbol};

use crate::EditorEvent;
use crate::error::{Error, Result};

#[cfg(test)]
#[path = "palette.test.rs"]
mod tests;

/// Specifies how palette items should be sorted.
#[derive(Debug, Clone, Copy, PartialEq, Eq, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum SortPaletteBy {
  /// Sort by brand and number alphanumerically.
  BrandAndNumber,
}

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum PaletteAction {
  AddItem {
    palitem: PaletteItem,
  },
  RemoveItems {
    palindexes: Vec<u32>,
    saved_palitems: Option<Vec<PaletteItem>>,
    saved_conflicts: Option<Vec<Stitch>>,
  },
  UpdateDisplaySettings {
    settings: PaletteSettings,
    old_settings: Option<PaletteSettings>,
  },
  Sort {
    sort_by: SortPaletteBy,
    old_positions: Option<Vec<u32>>,
  },
  Reorder {
    old_position: u32,
    new_position: u32,
    old_positions: Option<Vec<u32>>,
  },
  SetSymbol {
    palindex: u32,
    symbol: Option<Symbol>,
    old_symbol: Option<Option<Symbol>>,
  },
}

impl PaletteAction {
  pub fn perform(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::AddItem { palitem } => {
        embproj.pattern.palette.push(palitem.clone());
        let palindex = (embproj.pattern.palette.len() - 1) as u32;
        Ok(vec![
          EditorEvent::PaletteAddItem {
            palitem: palitem.clone(),
            palindex,
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::RemoveItems {
        palindexes,
        saved_palitems,
        saved_conflicts,
      } => {
        palindexes.sort_unstable();
        let mut palitems = Vec::with_capacity(palindexes.len());
        for &palindex in palindexes.iter().rev() {
          palitems.push(embproj.pattern.palette.remove(palindex));
        }
        // Reverse to restore in the order of `palindexes`.
        palitems.reverse();

        let conflicts = embproj.pattern.remove_stitches_by_palindexes(palindexes);
        saved_palitems.get_or_insert_with(|| palitems.clone());
        saved_conflicts.get_or_insert_with(|| conflicts.clone());

        Ok(vec![
          EditorEvent::PaletteRemoveItems(palindexes.clone()),
          EditorEvent::StitchesRemove {
            layer_index: 0,
            stitches: conflicts,
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::UpdateDisplaySettings { settings, old_settings } => {
        let prev = embproj.pattern.palette.settings();
        embproj.pattern.palette.set_settings(*settings);
        old_settings.get_or_insert(prev);
        Ok(vec![
          EditorEvent::PaletteUpdateDisplaySettings(*settings),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::Sort { sort_by, old_positions } => {
        old_positions.get_or_insert_with(|| embproj.pattern.palette.positions().to_vec());
        let new_positions = match sort_by {
          SortPaletteBy::BrandAndNumber => embproj.pattern.palette.sort_by_brand_and_number(),
        };
        Ok(vec![
          EditorEvent::PaletteSort(new_positions),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::Reorder {
        old_position,
        new_position,
        old_positions,
      } => {
        old_positions.get_or_insert_with(|| embproj.pattern.palette.positions().to_vec());
        let new_positions = embproj
          .pattern
          .palette
          .reorder_palette_items(*old_position, *new_position);
        Ok(vec![
          EditorEvent::PaletteReorder(new_positions),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::SetSymbol {
        palindex,
        symbol,
        old_symbol,
      } => {
        if old_symbol.is_none() {
          let prev = embproj
            .pattern
            .palette
            .get(*palindex)
            .and_then(|item| item.symbol.clone());
          *old_symbol = Some(prev);
        }
        if let Some(palitem) = embproj.pattern.palette.get_mut(*palindex) {
          palitem.symbol.clone_from(symbol);
        }
        Ok(vec![
          EditorEvent::PaletteSetSymbol {
            palindex: *palindex,
            symbol: symbol.clone(),
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }

  pub fn revoke(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::AddItem { .. } => {
        embproj.pattern.palette.pop();
        let removed_index = embproj.pattern.palette.len() as u32;
        Ok(vec![
          EditorEvent::PaletteRemoveItems(vec![removed_index]),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::RemoveItems {
        palindexes,
        saved_palitems,
        saved_conflicts,
      } => {
        let palitems = saved_palitems.take().ok_or(Error::ActionNotPerformed)?;
        let conflicts = saved_conflicts.take().ok_or(Error::ActionNotPerformed)?;

        for (index, &palindex) in palindexes.iter().enumerate() {
          embproj.pattern.palette.insert(palindex, palitems[index].clone());
        }

        let palette_len = embproj.pattern.palette.len() as u32;
        embproj
          .pattern
          .restore_stitches(0, conflicts.clone(), palindexes, palette_len);

        let mut events: Vec<EditorEvent> = palindexes
          .iter()
          .enumerate()
          .map(|(index, &palindex)| EditorEvent::PaletteAddItem {
            palitem: palitems[index].clone(),
            palindex,
          })
          .collect();

        events.push(EditorEvent::StitchesAdd {
          layer_index: 0,
          stitches: conflicts,
        });
        events.push(EditorEvent::PatternChanged(embproj.id));
        Ok(events)
      }
      Self::UpdateDisplaySettings { old_settings, .. } => {
        let old = old_settings.take().ok_or(Error::ActionNotPerformed)?;
        embproj.pattern.palette.set_settings(old);
        Ok(vec![
          EditorEvent::PaletteUpdateDisplaySettings(old),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::Sort { old_positions, .. } => {
        let old = old_positions.take().ok_or(Error::ActionNotPerformed)?;
        embproj.pattern.palette.set_positions(old.clone());
        Ok(vec![
          EditorEvent::PaletteSort(old),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::Reorder { old_positions, .. } => {
        let old = old_positions.take().ok_or(Error::ActionNotPerformed)?;
        embproj.pattern.palette.set_positions(old.clone());
        Ok(vec![
          EditorEvent::PaletteReorder(old),
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
      Self::SetSymbol {
        palindex, old_symbol, ..
      } => {
        let old = old_symbol.take().ok_or(Error::ActionNotPerformed)?;
        if let Some(palitem) = embproj.pattern.palette.get_mut(*palindex) {
          palitem.symbol.clone_from(&old);
        }
        Ok(vec![
          EditorEvent::PaletteSetSymbol {
            palindex: *palindex,
            symbol: old,
          },
          EditorEvent::PatternChanged(embproj.id),
        ])
      }
    }
  }
}
