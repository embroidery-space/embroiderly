use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use rand::seq::SliceRandom;
use tauri::test::{mock_builder, MockRuntime};
use tauri::{generate_context, App, Listener, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

use super::{Action, AddPaletteItemAction, AddedPaletteItemData, RemovePaletteItemsAction};
use crate::core::parser::oxs;
use crate::core::pattern::display::{Formats, Symbols};
use crate::core::pattern::{PaletteItem, PatternProject, Stitch};

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

fn create_pattern_project() -> PatternProject {
  let file_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("testdata/patterns/rainbow.oxs");
  oxs::parse_pattern(file_path).unwrap()
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
    bead: None,
    strands: None,
  };
  let action = AddPaletteItemAction::new(palitem.clone());

  // Test executing the command.
  {
    window.listen("palette:add_palette_item", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: AddedPaletteItemData = borsh::from_slice(&STANDARD.decode(base64).unwrap()).unwrap();
      assert_eq!(
        expected,
        AddedPaletteItemData {
          palitem: palitem.clone(),
          palindex: 7,
          symbols: Symbols::default(),
          formats: Formats::default(),
        }
      );
    });

    assert_eq!(patproj.pattern.palette.len(), 7);
    action.perform(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.palette.len(), 8);
  }

  // Test revoking the command.
  {
    window.listen("palette:remove_palette_item", move |e| {
      assert_eq!(serde_json::from_str::<usize>(e.payload()).unwrap(), 7);
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
  expected_palindexes: Vec<u8>,
  initial_palsize: usize,
  expected_palsize: usize,
) {
  let remove_palette_items_event_id = window.listen("palette:remove_palette_items", move |e| {
    let received_palindexes = serde_json::from_str::<Vec<u8>>(e.payload()).unwrap();
    assert_eq!(received_palindexes, expected_palindexes);
  });
  let remove_many_stitches_event_id = window.listen("stitches:remove_many", move |e| {
    let base64: &str = serde_json::from_str(e.payload()).unwrap();
    let conflicts: Vec<Stitch> = borsh::from_slice(&STANDARD.decode(base64).unwrap()).unwrap();
    assert_eq!(conflicts.is_empty(), false);
  });

  assert_eq!(patproj.pattern.palette.len(), initial_palsize);
  action.perform(window, patproj).unwrap();
  assert_eq!(patproj.pattern.palette.len(), expected_palsize);

  window.unlisten(remove_palette_items_event_id);
  window.unlisten(remove_many_stitches_event_id);
}

fn assert_revoking_remove_palette_items_action(
  action: &RemovePaletteItemsAction,
  window: &WebviewWindow<tauri::test::MockRuntime>,
  patproj: &mut PatternProject,
  expected_palindexes: Vec<u8>,
  initial_palsize: usize,
  expected_palsize: usize,
) {
  let add_palette_item_event_id = window.listen("palette:add_palette_item", move |e| {
    let base64: &str = serde_json::from_str(e.payload()).unwrap();
    let expected: AddedPaletteItemData = borsh::from_slice(&STANDARD.decode(base64).unwrap()).unwrap();
    assert!(expected_palindexes.contains(&expected.palindex));
  });
  let add_many_stitches_event_id = window.listen("stitches:add_many", move |e| {
    let base64: &str = serde_json::from_str(e.payload()).unwrap();
    let conflicts: Vec<Stitch> = borsh::from_slice(&STANDARD.decode(base64).unwrap()).unwrap();
    assert_eq!(conflicts.is_empty(), false);
  });

  assert_eq!(patproj.pattern.palette.len(), initial_palsize);
  action.revoke(window, patproj).unwrap();
  assert_eq!(patproj.pattern.palette.len(), expected_palsize);

  window.unlisten(add_palette_item_event_id);
  window.unlisten(add_many_stitches_event_id);
}

#[test]
/// Test removing a set of palette items against corner cases and general use cases.
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

#[test]
/// Test removing a set of palette items against random sets of palette item indixes.
fn test_remove_random_palette_items() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  let palette_size = patproj.pattern.palette.len();

  let mut rng = rand::rng();
  let palindexes: Vec<u8> = (0..(palette_size as u8)).collect();
  for size in 1..(palette_size + 1) {
    let mut selected_palindixes = palindexes.clone();
    selected_palindixes.shuffle(&mut rng);
    selected_palindixes.truncate(size as usize);

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
