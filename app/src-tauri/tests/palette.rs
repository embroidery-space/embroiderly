use embroiderly::commands;
use embroiderly::state::{HistoryState, PatternsState};
use embroiderly_pattern::{PaletteItem, PaletteSettings};
use tauri::Manager as _;

mod utils;

#[test]
fn adds_palette_item() {
  let (app, webview) = setup_test_app!(commands: [commands::core::palette::add_palette_item]);
  let pattern_id = utils::create_test_pattern(&app);

  let palitem = PaletteItem {
    brand: "DMC".to_string(),
    number: "310".to_string(),
    name: "Black".to_string(),
    color: "#000000".to_string(),
    blends: None,
    symbol: None,
    symbol_font: None,
  };
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "add_palette_item",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&palitem).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert!(patproj.pattern.palette.contains(&palitem));

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}

#[test]
fn does_not_add_duplicate_palette_item() {
  let (app, webview) = setup_test_app!(commands: [commands::core::palette::add_palette_item]);
  let pattern_id = utils::create_test_pattern(&app);

  let palitem = PaletteItem {
    brand: "DMC".to_string(),
    number: "310".to_string(),
    name: "Black".to_string(),
    color: "#000000".to_string(),
    blends: None,
    symbol: None,
    symbol_font: None,
  };
  invoke_ipc!(
    &webview,
    cmd: "add_palette_item",
    body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&palitem).unwrap()),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "add_palette_item",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&palitem).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}

#[test]
fn removes_palette_items() {
  let (app, webview) = setup_test_app!(commands: [
    commands::core::palette::add_palette_item,
    commands::core::palette::remove_palette_items
  ]);
  let pattern_id = utils::create_test_pattern(&app);

  let palitem1 = PaletteItem {
    brand: "DMC".to_string(),
    number: "310".to_string(),
    name: "Black".to_string(),
    color: "#000000".to_string(),
    blends: None,
    symbol: None,
    symbol_font: None,
  };
  invoke_ipc!(
    &webview,
    cmd: "add_palette_item",
    body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&palitem1).unwrap()),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();

  let palitem2 = PaletteItem {
    brand: "DMC".to_string(),
    number: "blanc".to_string(),
    name: "White".to_string(),
    color: "#FFFFFF".to_string(),
    blends: None,
    symbol: None,
    symbol_font: None,
  };
  invoke_ipc!(
    &webview,
    cmd: "add_palette_item",
    body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&palitem2).unwrap()),
    headers: [("patternId", pattern_id.to_string().parse().unwrap())]
  )
  .unwrap();

  assert!(
    invoke_ipc!(
      &webview,
      cmd: "remove_palette_items",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "paletteItemIndexes": [0] })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.pattern.palette.len(), 1);
  assert!(!patproj.pattern.palette.contains(&palitem1));
  assert!(patproj.pattern.palette.contains(&palitem2));

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 3);
}

#[test]
fn updates_palette_display_settings() {
  let (app, webview) = setup_test_app!(commands: [commands::core::palette::update_palette_display_settings]);
  let pattern_id = utils::create_test_pattern(&app);

  let new_palette_settings = PaletteSettings {
    columns_number: 2,
    color_only: true,
    show_stitch_symbols: false,
    stitch_symbols_on_contrast_background: false,
    show_color_brands: false,
    show_color_numbers: true,
    show_color_names: false,
  };
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "update_palette_display_settings",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&new_palette_settings).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.display_settings.palette_settings, new_palette_settings);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}

#[test]
fn sorts_palette_by_brand_and_number() {
  let (app, webview) = setup_test_app!(commands: [
    commands::core::palette::add_palette_item,
    commands::core::palette::sort_palette_by
  ]);
  let pattern_id = utils::create_test_pattern(&app);

  // Add palette items in non-sorted order.
  let palitems = vec![
    PaletteItem {
      brand: "DMC".to_string(),
      number: "310".to_string(),
      name: "Black".to_string(),
      color: "#000000".to_string(),
      blends: None,
      symbol: None,
      symbol_font: None,
    },
    PaletteItem {
      brand: "DMC".to_string(),
      number: "3865".to_string(),
      name: "Winter White".to_string(),
      color: "#F9F9F9".to_string(),
      blends: None,
      symbol: None,
      symbol_font: None,
    },
    PaletteItem {
      brand: "DMC".to_string(),
      number: "blanc".to_string(),
      name: "White".to_string(),
      color: "#FFFFFF".to_string(),
      blends: None,
      symbol: None,
      symbol_font: None,
    },
    PaletteItem {
      brand: "Anchor".to_string(),
      number: "1".to_string(),
      name: "White".to_string(),
      color: "#FFFFFF".to_string(),
      blends: None,
      symbol: None,
      symbol_font: None,
    },
  ];
  for palitem in &palitems {
    invoke_ipc!(
      &webview,
      cmd: "add_palette_item",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(palitem).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .unwrap();
  }

  // Verify initial order: DMC 310, DMC 3865, DMC blanc, Anchor 1.
  {
    let patterns_state = app.state::<PatternsState>();
    let patterns_manager = patterns_state.read().unwrap();
    let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
    assert_eq!(patproj.pattern.palette.positions(), &[0, 1, 2, 3]);
  }

  // Sort the palette.
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "sort_palette_by",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "sortBy": "BrandAndNumber" })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  // Verify sorted order: Anchor 1, DMC 310, DMC 3865, DMC blanc.
  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.pattern.palette.positions(), &[3, 0, 1, 2]);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  // Verify history stack has 5 items (4 adds + 1 sort).
  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 5);
}

#[test]
fn reorders_palette_items() {
  let (app, webview) = setup_test_app!(commands: [
    commands::core::palette::add_palette_item,
    commands::core::palette::reorder_palette_items
  ]);
  let pattern_id = utils::create_test_pattern(&app);

  // Add palette items.
  let palitems = vec![
    PaletteItem {
      brand: "DMC".to_string(),
      number: "310".to_string(),
      name: "Black".to_string(),
      color: "#000000".to_string(),
      blends: None,
      symbol: None,
      symbol_font: None,
    },
    PaletteItem {
      brand: "DMC".to_string(),
      number: "3865".to_string(),
      name: "Winter White".to_string(),
      color: "#F9F9F9".to_string(),
      blends: None,
      symbol: None,
      symbol_font: None,
    },
    PaletteItem {
      brand: "DMC".to_string(),
      number: "321".to_string(),
      name: "Christmas Red".to_string(),
      color: "#B1272A".to_string(),
      blends: None,
      symbol: None,
      symbol_font: None,
    },
  ];
  for palitem in &palitems {
    invoke_ipc!(
      &webview,
      cmd: "add_palette_item",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(palitem).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .unwrap();
  }

  // Verify initial order.
  {
    let patterns_state = app.state::<PatternsState>();
    let patterns_manager = patterns_state.read().unwrap();
    let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
    assert_eq!(patproj.pattern.palette.positions(), &[0, 1, 2]);
  }

  // Reorder: move first item to last position (0 -> 2).
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "reorder_palette_items",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({ "oldPosition": 0, "newPosition": 2 })),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  // Verify new order: [1, 2, 0] (White, Red, Black).
  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.pattern.palette.positions(), &[1, 2, 0]);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  // Verify history stack has 4 items (3 adds + 1 reorder).
  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 4);
}
