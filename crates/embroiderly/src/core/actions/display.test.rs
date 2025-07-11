use embroiderly_pattern::{DisplayMode, LayersVisibility, PatternProject};
use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindowBuilder, generate_context};

use super::{Action, SetDisplayModeAction, SetLayersVisibilityAction, ShowSymbolsAction};
use crate::utils::base64;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

#[test]
fn test_set_display_mode() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();

  let old_mode = patproj.display_settings.display_mode.clone();
  let mode = DisplayMode::Stitches;
  let action = SetDisplayModeAction::new(mode.clone());

  // Test executing the command.
  {
    let event_id = window.listen("display:set_mode", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: DisplayMode = str.parse().unwrap();
      assert_eq!(expected, mode);
    });

    action.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the command.
  {
    window.listen("display:set_mode", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: DisplayMode = str.parse().unwrap();
      assert_eq!(expected, old_mode);
    });

    action.revoke(&window, &mut patproj).unwrap();
  }
}

#[test]
fn test_show_symbols() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();

  // Store the initial value and set to the opposite for our test
  let initial_value = patproj.display_settings.show_symbols;
  let new_value = !initial_value;
  let action = ShowSymbolsAction::new(new_value);

  // Test executing the command
  {
    let expected_value = new_value;
    let event_id = window.listen("display:show_symbols", move |e| {
      let value: bool = serde_json::from_str(e.payload()).unwrap();
      assert_eq!(value, expected_value);
    });

    action.perform(&window, &mut patproj).unwrap();
    assert_eq!(patproj.display_settings.show_symbols, new_value);
    window.unlisten(event_id);
  }

  // Test revoking the command
  {
    let expected_value = !new_value;
    let event_id = window.listen("display:show_symbols", move |e| {
      let value: bool = serde_json::from_str(e.payload()).unwrap();
      assert_eq!(value, expected_value);
    });

    action.revoke(&window, &mut patproj).unwrap();
    assert_eq!(patproj.display_settings.show_symbols, !new_value);
    window.unlisten(event_id);
  }
}

#[test]
fn test_layers_visibility() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();
  let visibility = LayersVisibility {
    fullstitches: true,
    petitestitches: false,
    halfstitches: true,
    quarterstitches: false,
    specialstitches: false,
    lines: false,
    nodes: false,
    grid: true,
    rulers: true,
  };
  let action = SetLayersVisibilityAction::new(visibility.clone());

  // Test executing the command
  {
    let event_id = window.listen("display:set_layers_visibility", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: LayersVisibility = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected, visibility);
    });

    action.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the command
  {
    window.listen("display:set_layers_visibility", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: LayersVisibility = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected, LayersVisibility::default());
    });

    action.revoke(&window, &mut patproj).unwrap();
  }
}
