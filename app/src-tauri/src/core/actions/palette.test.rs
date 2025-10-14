use embroiderly_pattern::{PaletteItem, PaletteSettings, PatternProject, Stitch};
use rand::seq::SliceRandom;
use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindow, WebviewWindowBuilder, generate_context};

use super::{
  Action, AddPaletteItemAction, AddedPaletteItemData, RemovePaletteItemsAction, ReorderPaletteItemsAction,
  SortPaletteAction, SortPaletteBy, UpdatePaletteDisplaySettingsAction,
};
use crate::utils::base64;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

fn create_pattern_project() -> PatternProject {
  let file_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("testdata/patterns/rainbow.oxs");
  embroiderly_parsers::oxs::parse_pattern(file_path).unwrap()
}

#[test]
fn test_add_palette_item() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  let palitem = PaletteItem {
    brand: String::from("DMC"),
    number: String::from("3825"),
    name: String::from("Pumpkin-Pale"),
    color: String::from("F5BA82"),
    blends: None,
    symbol_font: None,
    symbol: None,
  };
  let action = AddPaletteItemAction::new(palitem.clone());

  // Test executing the command.
  {
    window.once("palette:add_palette_item", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: AddedPaletteItemData = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(
        expected,
        AddedPaletteItemData {
          palitem: palitem.clone(),
          palindex: 7,
        }
      );
    });

    assert_eq!(patproj.pattern.palette.len(), 7);
    action.perform(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.palette.len(), 8);
  }

  // Test revoking the command.
  {
    window.once("palette:remove_palette_item", move |e| {
      assert_eq!(serde_json::from_str::<Vec<u32>>(e.payload()).unwrap(), vec![7]);
    });

    assert_eq!(patproj.pattern.palette.len(), 8);
    action.revoke(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.palette.len(), 7);
  }
}

fn assert_executing_remove_palette_items_action(
  action: &RemovePaletteItemsAction,
  window: &WebviewWindow<tauri::test::MockRuntime>,
  patproj: &mut PatternProject,
  expected_palindexes: Vec<u32>,
  initial_palsize: usize,
  expected_palsize: usize,
) {
  window.once("palette:remove_palette_item", move |e| {
    let received_palindexes = serde_json::from_str::<Vec<u32>>(e.payload()).unwrap();
    assert_eq!(received_palindexes, expected_palindexes);
  });
  window.once("stitches:remove", move |e| {
    let base64: &str = serde_json::from_str(e.payload()).unwrap();
    let conflicts: Vec<Stitch> = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
    assert!(!conflicts.is_empty());
  });

  assert_eq!(patproj.pattern.palette.len(), initial_palsize);
  action.perform(window, patproj).unwrap();
  assert_eq!(patproj.pattern.palette.len(), expected_palsize);
}

fn assert_revoking_remove_palette_items_action(
  action: &RemovePaletteItemsAction,
  window: &WebviewWindow<tauri::test::MockRuntime>,
  patproj: &mut PatternProject,
  expected_palindexes: Vec<u32>,
  initial_palsize: usize,
  expected_palsize: usize,
) {
  window.once("palette:add_palette_item", move |e| {
    let base64: &str = serde_json::from_str(e.payload()).unwrap();
    let expected: AddedPaletteItemData = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
    assert!(expected_palindexes.contains(&expected.palindex));
  });
  window.once("stitches:add", move |e| {
    let base64: &str = serde_json::from_str(e.payload()).unwrap();
    let conflicts: Vec<Stitch> = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
    assert!(!conflicts.is_empty());
  });

  assert_eq!(patproj.pattern.palette.len(), initial_palsize);
  action.revoke(window, patproj).unwrap();
  assert_eq!(patproj.pattern.palette.len(), expected_palsize);
}

/// Test removing a set of palette items against corner cases and general use cases.
#[test]
fn test_remove_palette_items() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  let palette_size = patproj.pattern.palette.len();

  let palindexes_sets = [vec![0, 1, 2], vec![4, 5, 6], vec![2, 3, 5], vec![0, 6]];
  for palindexes in palindexes_sets.into_iter() {
    let action = RemovePaletteItemsAction::new(palindexes.clone());

    // Test executing the command.
    assert_executing_remove_palette_items_action(
      &action,
      &window,
      &mut patproj,
      palindexes.clone(),
      palette_size,
      palette_size - palindexes.len(),
    );

    // Test revoking the command.
    assert_revoking_remove_palette_items_action(
      &action,
      &window,
      &mut patproj,
      palindexes.clone(),
      palette_size - palindexes.len(),
      palette_size,
    );
  }
}

/// Test removing a set of palette items against random sets of palette item indixes.
#[test]
fn test_remove_random_palette_items() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  let palette_size = patproj.pattern.palette.len();

  let mut rng = rand::rng();
  let palindexes: Vec<u32> = (0..(palette_size as u32)).collect();
  for size in 1..(palette_size + 1) {
    let mut selected_palindixes = palindexes.clone();
    selected_palindixes.shuffle(&mut rng);
    selected_palindixes.truncate(size);

    let action = RemovePaletteItemsAction::new(selected_palindixes.clone());

    // Test executing the command.
    assert_executing_remove_palette_items_action(
      &action,
      &window,
      &mut patproj,
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
      &action,
      &window,
      &mut patproj,
      selected_palindixes.clone(),
      palette_size - selected_palindixes.len(),
      palette_size,
    );
  }
}

#[test]
fn test_update_palette_display_settings() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  let old_settings = patproj.display_settings.palette_settings.clone();
  let new_settings = PaletteSettings {
    columns_number: 4,
    color_only: true,
    show_stitch_symbols: true,
    stitch_symbols_on_contrast_background: true,
    show_color_brands: true,
    show_color_names: true,
    show_color_numbers: true,
  };
  let action = UpdatePaletteDisplaySettingsAction::new(new_settings.clone());

  // Test executing the command.
  {
    window.once("palette:update_display_settings", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let received_settings: PaletteSettings = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(received_settings, new_settings);
    });

    action.perform(&window, &mut patproj).unwrap();
  }

  // Test revoking the command.
  {
    window.once("palette:update_display_settings", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let received_settings: PaletteSettings = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(received_settings, old_settings);
    });

    action.revoke(&window, &mut patproj).unwrap();
  }
}

#[test]
fn test_sort_palette_action() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  let initial_positions = patproj.pattern.palette.positions().to_vec();
  let action = SortPaletteAction::new(SortPaletteBy::BrandAndNumber);

  // Test executing the action.
  {
    let initial_positions_clone = initial_positions.clone();
    window.once("palette:sort", move |e| {
      let new_positions = serde_json::from_str::<Vec<u32>>(e.payload()).unwrap();

      // Verify that positions have been sorted (they should differ from initial).
      assert_ne!(new_positions, initial_positions_clone);

      // Verify that all original indexes are present.
      let mut sorted_new_positions = new_positions.clone();
      sorted_new_positions.sort();
      assert_eq!(sorted_new_positions, initial_positions_clone);
    });

    action.perform(&window, &mut patproj).unwrap();
    let sorted_positions = patproj.pattern.palette.positions().to_vec();
    // Verify positions changed in the pattern.
    assert_ne!(sorted_positions, initial_positions);
  }

  // Test revoking the action.
  {
    let initial_positions_clone = initial_positions.clone();
    window.once("palette:sort", move |e| {
      let restored_positions = serde_json::from_str::<Vec<u32>>(e.payload()).unwrap();
      // Verify that old positions were restored.
      assert_eq!(restored_positions, initial_positions_clone);
    });

    action.revoke(&window, &mut patproj).unwrap();
    // Verify positions restored in the pattern.
    assert_eq!(patproj.pattern.palette.positions(), initial_positions.as_slice());
  }
}

#[test]
fn test_reorder_palette_items_action() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  let initial_positions = patproj.pattern.palette.positions().to_vec();
  let old_position = 0;
  let new_position = 3;
  let action = ReorderPaletteItemsAction::new(old_position, new_position);

  // Test executing the action.
  {
    let initial_positions_clone = initial_positions.clone();
    window.once("palette:reorder", move |e| {
      let new_positions = serde_json::from_str::<Vec<u32>>(e.payload()).unwrap();
      assert_ne!(new_positions, initial_positions_clone);
      assert_eq!(
        new_positions[new_position as usize],
        initial_positions_clone[old_position as usize]
      );
    });

    action.perform(&window, &mut patproj).unwrap();
  }

  // Test revoking the action.
  {
    let initial_positions_clone = initial_positions.clone();
    window.once("palette:reorder", move |e| {
      let restored_positions = serde_json::from_str::<Vec<u32>>(e.payload()).unwrap();
      assert_eq!(restored_positions, initial_positions_clone);
    });

    action.revoke(&window, &mut patproj).unwrap();
    // Verify positions restored in the pattern.
    assert_eq!(patproj.pattern.palette.positions(), initial_positions.as_slice());
  }
}
