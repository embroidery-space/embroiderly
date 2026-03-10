use embroiderly_pattern::{DisplayMode, DisplaySettings, LayersVisibility, PatternProject};
use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindowBuilder, generate_context};

use super::{Action, UpdateDisplaySettingsAction};
use crate::utils::base64;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

#[test]
fn test_update_display_settings() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();

  let old_display_settings = patproj.display_settings.clone();
  let new_display_settings = DisplaySettings {
    display_mode: DisplayMode::Stitches,
    show_symbols: true,
    show_grid: false,
    show_rulers: false,
    layers_visibility: LayersVisibility {
      reference_image: false,
      fullstitches: true,
      petitestitches: false,
      halfstitches: true,
      quarterstitches: false,
      specialstitches: false,
      backstitches: false,
      straightstitches: false,
      frenchknots: false,
      beads: false,
    },
    ..old_display_settings.clone()
  };
  let action = UpdateDisplaySettingsAction::new(new_display_settings.clone());

  // Test executing the action.
  {
    let expected = new_display_settings.clone();
    window.once("display:update", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let actual: DisplaySettings = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(actual, expected);
    });
    window.once("app:pattern-changed", {
      let id = patproj.id.to_string();
      move |e| {
        assert_eq!(serde_json::from_str::<String>(e.payload()).unwrap(), id);
      }
    });

    action.perform(&window, &mut patproj).unwrap();
    assert_eq!(patproj.display_settings, new_display_settings);
  }

  // Test revoking the action.
  {
    let expected = old_display_settings.clone();
    window.once("display:update", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let actual: DisplaySettings = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(actual, expected);
    });
    window.once("app:pattern-changed", {
      let id = patproj.id.to_string();
      move |e| {
        assert_eq!(serde_json::from_str::<String>(e.payload()).unwrap(), id);
      }
    });

    action.revoke(&window, &mut patproj).unwrap();
    assert_eq!(patproj.display_settings, old_display_settings);
  }
}
