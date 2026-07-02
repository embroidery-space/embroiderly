use embroiderly_pattern::{EmbroiderlyProject, PaletteItem, PaletteSettings};
use rand::seq::SliceRandom;

use crate::actions::PaletteAction;
use crate::actions::palette::SortPaletteBy;
use crate::{EditorAction, EditorEvent};

fn create_pattern_project() -> EmbroiderlyProject {
  let file_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../testdata/patterns/rainbow.oxs");
  embroiderly_parsers::oxs::parse_pattern(&std::fs::read(file_path).unwrap()).unwrap()
}

#[test]
fn test_add_palette_item() {
  let mut embproj = create_pattern_project();
  let palitem = PaletteItem {
    brand: String::from("DMC"),
    number: String::from("3825"),
    name: String::from("Pumpkin-Pale"),
    color: String::from("F5BA82"),
    blends: None,
    symbol: None,
  };
  let mut action = EditorAction::Palette(PaletteAction::AddItem {
    palitem: palitem.clone(),
  });

  // Test executing the command.
  {
    assert_eq!(embproj.pattern.palette.len(), 7);
    let events = action.perform(&mut embproj).unwrap();
    assert_eq!(embproj.pattern.palette.len(), 8);

    let EditorEvent::PaletteAddItem {
      palitem: item,
      palindex,
    } = &events[0]
    else {
      panic!("expected PaletteAddItem");
    };
    assert_eq!(item, &palitem);
    assert_eq!(palindex, &7);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the command.
  {
    assert_eq!(embproj.pattern.palette.len(), 8);
    let events = action.revoke(&mut embproj).unwrap();
    assert_eq!(embproj.pattern.palette.len(), 7);

    let EditorEvent::PaletteRemoveItems(palindexes) = &events[0] else {
      panic!("expected PaletteRemoveItems");
    };
    assert_eq!(palindexes, &[7]);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}

fn assert_executing_remove_palette_items_action(
  action: &mut EditorAction,
  embproj: &mut EmbroiderlyProject,
  expected_palindexes: Vec<u32>,
  initial_palsize: usize,
  expected_palsize: usize,
) {
  assert_eq!(embproj.pattern.palette.len(), initial_palsize);
  let events = action.perform(embproj).unwrap();
  assert_eq!(embproj.pattern.palette.len(), expected_palsize);

  let EditorEvent::PaletteRemoveItems(palindexes) = &events[0] else {
    panic!("expected PaletteRemoveItems");
  };
  assert_eq!(palindexes, &expected_palindexes);

  let EditorEvent::StitchesRemove { stitches, .. } = &events[1] else {
    panic!("expected StitchesRemove");
  };
  assert!(!stitches.is_empty());

  assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
}

fn assert_revoking_remove_palette_items_action(
  action: &mut EditorAction,
  embproj: &mut EmbroiderlyProject,
  expected_palindexes: Vec<u32>,
  initial_palsize: usize,
  expected_palsize: usize,
) {
  assert_eq!(embproj.pattern.palette.len(), initial_palsize);
  let events = action.revoke(embproj).unwrap();
  assert_eq!(embproj.pattern.palette.len(), expected_palsize);

  // First events are PaletteAddItem, one per restored palindex.
  for event in events.iter().take(expected_palindexes.len()) {
    let EditorEvent::PaletteAddItem { palindex, .. } = event else {
      panic!("expected PaletteAddItem");
    };
    assert!(expected_palindexes.contains(palindex));
  }

  let stitches_add_event = &events[expected_palindexes.len()];
  let EditorEvent::StitchesAdd { stitches, .. } = stitches_add_event else {
    panic!("expected StitchesAdd");
  };
  assert!(!stitches.is_empty());

  assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
}

/// Test removing a set of palette items against corner cases and general use cases.
#[test]
fn test_remove_palette_items() {
  let mut embproj = create_pattern_project();
  let palette_size = embproj.pattern.palette.len();

  let palindexes_sets = [vec![0, 1, 2], vec![4, 5, 6], vec![2, 3, 5], vec![0, 6]];
  for palindexes in palindexes_sets.into_iter() {
    let mut action = EditorAction::Palette(PaletteAction::RemoveItems {
      palindexes: palindexes.clone(),
      saved_palitems: None,
      saved_conflicts: None,
    });

    // Test executing the command.
    assert_executing_remove_palette_items_action(
      &mut action,
      &mut embproj,
      palindexes.clone(),
      palette_size,
      palette_size - palindexes.len(),
    );

    // Test revoking the command.
    assert_revoking_remove_palette_items_action(
      &mut action,
      &mut embproj,
      palindexes.clone(),
      palette_size - palindexes.len(),
      palette_size,
    );
  }
}

/// Test removing a set of palette items against random sets of palette item indixes.
#[test]
fn test_remove_random_palette_items() {
  let mut embproj = create_pattern_project();
  let palette_size = embproj.pattern.palette.len();

  let mut rng = rand::rng();
  let palindexes: Vec<u32> = (0..(palette_size as u32)).collect();
  for size in 1..(palette_size + 1) {
    let mut selected_palindixes = palindexes.clone();
    selected_palindixes.shuffle(&mut rng);
    selected_palindixes.truncate(size);

    let mut action = EditorAction::Palette(PaletteAction::RemoveItems {
      palindexes: selected_palindixes.clone(),
      saved_palitems: None,
      saved_conflicts: None,
    });

    // Test executing the command.
    assert_executing_remove_palette_items_action(
      &mut action,
      &mut embproj,
      {
        let mut expected_palindexes = selected_palindixes.clone();
        expected_palindexes.sort();
        expected_palindexes
      },
      palette_size,
      palette_size - selected_palindixes.len(),
    );

    // Test revoking the command.
    assert_revoking_remove_palette_items_action(
      &mut action,
      &mut embproj,
      selected_palindixes.clone(),
      palette_size - selected_palindixes.len(),
      palette_size,
    );
  }
}

#[test]
fn test_update_palette_display_settings() {
  let mut embproj = create_pattern_project();
  let old_settings = embproj.pattern.palette.settings();
  let new_settings = PaletteSettings {
    columns_number: 4,
    color_only: true,
    show_stitch_symbols: true,
    stitch_symbols_on_contrast_background: true,
    show_color_brands: true,
    show_color_names: true,
    show_color_numbers: true,
  };
  let mut action = EditorAction::Palette(PaletteAction::UpdateDisplaySettings {
    settings: new_settings,
    old_settings: None,
  });

  // Test executing the command.
  {
    let events = action.perform(&mut embproj).unwrap();
    let EditorEvent::PaletteUpdateDisplaySettings(settings) = &events[0] else {
      panic!("expected PaletteUpdateDisplaySettings");
    };
    assert_eq!(settings, &new_settings);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the command.
  {
    let events = action.revoke(&mut embproj).unwrap();
    let EditorEvent::PaletteUpdateDisplaySettings(settings) = &events[0] else {
      panic!("expected PaletteUpdateDisplaySettings");
    };
    assert_eq!(settings, &old_settings);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}

#[test]
fn test_sort_palette_action() {
  let mut embproj = create_pattern_project();
  let initial_positions = embproj.pattern.palette.positions().to_vec();
  let mut action = EditorAction::Palette(PaletteAction::Sort {
    sort_by: SortPaletteBy::BrandAndNumber,
    old_positions: None,
  });

  // Test executing the action.
  {
    let events = action.perform(&mut embproj).unwrap();
    let sorted_positions = embproj.pattern.palette.positions().to_vec();
    // Verify positions changed in the pattern.
    assert_ne!(sorted_positions, initial_positions);

    let EditorEvent::PaletteSort(new_positions) = &events[0] else {
      panic!("expected PaletteSort");
    };
    // Verify that positions have been sorted (they should differ from initial).
    assert_ne!(new_positions, &initial_positions);
    // Verify that all original indexes are present.
    let mut sorted_new_positions = new_positions.clone();
    sorted_new_positions.sort();
    assert_eq!(sorted_new_positions, initial_positions);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the action.
  {
    let events = action.revoke(&mut embproj).unwrap();
    // Verify positions restored in the pattern.
    assert_eq!(embproj.pattern.palette.positions(), initial_positions.as_slice());

    let EditorEvent::PaletteSort(restored_positions) = &events[0] else {
      panic!("expected PaletteSort");
    };
    // Verify that old positions were restored.
    assert_eq!(restored_positions, &initial_positions);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}

#[test]
fn test_reorder_palette_items_action() {
  let mut embproj = create_pattern_project();
  let initial_positions = embproj.pattern.palette.positions().to_vec();
  let old_position = 0u32;
  let new_position = 3u32;
  let mut action = EditorAction::Palette(PaletteAction::Reorder {
    old_position,
    new_position,
    old_positions: None,
  });

  // Test executing the action.
  {
    let events = action.perform(&mut embproj).unwrap();

    let EditorEvent::PaletteReorder(new_positions) = &events[0] else {
      panic!("expected PaletteReorder");
    };
    assert_ne!(new_positions, &initial_positions);
    assert_eq!(
      new_positions[new_position as usize],
      initial_positions[old_position as usize]
    );

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the action.
  {
    let events = action.revoke(&mut embproj).unwrap();
    // Verify positions restored in the pattern.
    assert_eq!(embproj.pattern.palette.positions(), initial_positions.as_slice());

    let EditorEvent::PaletteReorder(restored_positions) = &events[0] else {
      panic!("expected PaletteReorder");
    };
    assert_eq!(restored_positions, &initial_positions);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}

#[test]
fn test_set_symbol_action() {
  use embroiderly_pattern::Symbol;

  let mut embproj = create_pattern_project();

  let symbol = Symbol {
    char: 'A',
    font: "Arial".to_string(),
  };
  let mut action = EditorAction::Palette(PaletteAction::SetSymbol {
    palindex: 0,
    symbol: Some(symbol.clone()),
    old_symbol: None,
  });

  // Test executing the action.
  {
    // Verify symbol is not set initially.
    assert!(embproj.pattern.palette.get(0).unwrap().symbol.is_none());

    let events = action.perform(&mut embproj).unwrap();

    // Verify symbol was set.
    let set_symbol = embproj.pattern.palette.get(0).unwrap().symbol.as_ref().unwrap();
    assert_eq!(set_symbol.char, 'A');
    assert_eq!(set_symbol.font, "Arial");

    let EditorEvent::PaletteSetSymbol { palindex, symbol: sym } = &events[0] else {
      panic!("expected PaletteSetSymbol");
    };
    assert_eq!(palindex, &0);
    assert!(sym.is_some());
    let sym = sym.as_ref().unwrap();
    assert_eq!(sym.char, 'A');
    assert_eq!(sym.font, "Arial");

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the action.
  {
    let events = action.revoke(&mut embproj).unwrap();

    // Verify symbol was unset.
    assert!(embproj.pattern.palette.get(0).unwrap().symbol.is_none());

    let EditorEvent::PaletteSetSymbol { palindex, symbol: sym } = &events[0] else {
      panic!("expected PaletteSetSymbol");
    };
    assert_eq!(palindex, &0);
    assert!(sym.is_none());

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}

#[test]
fn test_unset_symbol_action() {
  use embroiderly_pattern::Symbol;

  let mut embproj = create_pattern_project();

  // Set a symbol on the first palette item.
  if let Some(item) = embproj.pattern.palette.get_mut(0) {
    item.symbol = Some(Symbol {
      char: 'B',
      font: "Times".to_string(),
    });
  }

  // Verify initial state.
  assert!(embproj.pattern.palette.get(0).unwrap().symbol.is_some());

  let mut action = EditorAction::Palette(PaletteAction::SetSymbol {
    palindex: 0,
    symbol: None,
    old_symbol: None,
  });

  // Test executing the action.
  {
    let events = action.perform(&mut embproj).unwrap();

    // Verify symbol was unset.
    assert!(embproj.pattern.palette.get(0).unwrap().symbol.is_none());

    let EditorEvent::PaletteSetSymbol { palindex, symbol: sym } = &events[0] else {
      panic!("expected PaletteSetSymbol");
    };
    assert_eq!(palindex, &0);
    assert!(sym.is_none());

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the action.
  {
    let events = action.revoke(&mut embproj).unwrap();

    // Verify original symbol was restored.
    let restored = embproj.pattern.palette.get(0).unwrap().symbol.as_ref().unwrap();
    assert_eq!(restored.char, 'B');
    assert_eq!(restored.font, "Times");

    let EditorEvent::PaletteSetSymbol { palindex, symbol: sym } = &events[0] else {
      panic!("expected PaletteSetSymbol");
    };
    assert_eq!(palindex, &0);
    assert!(sym.is_some());
    let sym = sym.as_ref().unwrap();
    assert_eq!(sym.char, 'B');
    assert_eq!(sym.font, "Times");

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}

#[test]
fn test_replace_symbol_action() {
  use embroiderly_pattern::Symbol;

  let mut embproj = create_pattern_project();

  // Set initial symbol.
  if let Some(item) = embproj.pattern.palette.get_mut(0) {
    item.symbol = Some(Symbol {
      char: 'X',
      font: "Font1".to_string(),
    });
  }

  let new_symbol = Symbol {
    char: 'Y',
    font: "Font2".to_string(),
  };
  let mut action = EditorAction::Palette(PaletteAction::SetSymbol {
    palindex: 0,
    symbol: Some(new_symbol),
    old_symbol: None,
  });

  // Test executing the action.
  {
    let events = action.perform(&mut embproj).unwrap();

    // Verify new symbol.
    let set_symbol = embproj.pattern.palette.get(0).unwrap().symbol.as_ref().unwrap();
    assert_eq!(set_symbol.char, 'Y');
    assert_eq!(set_symbol.font, "Font2");

    let EditorEvent::PaletteSetSymbol { palindex, symbol: sym } = &events[0] else {
      panic!("expected PaletteSetSymbol");
    };
    assert_eq!(palindex, &0);
    let sym = sym.as_ref().unwrap();
    assert_eq!(sym.char, 'Y');
    assert_eq!(sym.font, "Font2");

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the action.
  {
    let events = action.revoke(&mut embproj).unwrap();

    // Verify original symbol was restored.
    let restored = embproj.pattern.palette.get(0).unwrap().symbol.as_ref().unwrap();
    assert_eq!(restored.char, 'X');
    assert_eq!(restored.font, "Font1");

    let EditorEvent::PaletteSetSymbol { palindex, symbol: sym } = &events[0] else {
      panic!("expected PaletteSetSymbol");
    };
    assert_eq!(palindex, &0);
    let sym = sym.as_ref().unwrap();
    assert_eq!(sym.char, 'X');
    assert_eq!(sym.font, "Font1");

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}
