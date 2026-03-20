use embroiderly_pattern::PatternProject;
use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindowBuilder, generate_context};

use super::{Action, AddLayerAction, RemoveLayerAction};
use crate::utils::base64;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

fn create_pattern_project() -> PatternProject {
  PatternProject::new(Default::default())
}

#[test]
fn test_add_layer_action() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  let action = AddLayerAction::new("Layer 2".to_string());

  // Test performing the action.
  {
    window.once("layers:add", |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let bytes = base64::decode(base64).unwrap();
      let (index, layer): (u32, embroiderly_pattern::Layer) = borsh::from_slice(&bytes).unwrap();
      assert_eq!(index, 0);
      assert_eq!(layer.name, "Layer 2");
    });
    window.once("app:pattern-changed", {
      let id = patproj.id.to_string();
      move |e| {
        assert_eq!(serde_json::from_str::<String>(e.payload()).unwrap(), id);
      }
    });

    assert_eq!(patproj.pattern.layers.len(), 1);
    action.perform(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers.len(), 2);
    assert_eq!(patproj.pattern.layers[0].name, "Layer 2");
  }

  // Test revoking the action.
  {
    window.once("layers:remove", |e| {
      let index: u32 = serde_json::from_str(e.payload()).unwrap();
      assert_eq!(index, 0);
    });
    window.once("app:pattern-changed", {
      let id = patproj.id.to_string();
      move |e| {
        assert_eq!(serde_json::from_str::<String>(e.payload()).unwrap(), id);
      }
    });

    assert_eq!(patproj.pattern.layers.len(), 2);
    action.revoke(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers.len(), 1);
  }
}

#[test]
fn test_remove_layer_action() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  // Add a second layer first. With add_layer inserting at index 0, Layer 2 is at index 0.
  patproj.pattern.add_layer(embroiderly_pattern::Layer::new("Layer 2"));

  let action = RemoveLayerAction::new(0);

  // Test performing the action.
  {
    window.once("layers:remove", |e| {
      let index: u32 = serde_json::from_str(e.payload()).unwrap();
      assert_eq!(index, 0);
    });
    window.once("app:pattern-changed", {
      let id = patproj.id.to_string();
      move |e| {
        assert_eq!(serde_json::from_str::<String>(e.payload()).unwrap(), id);
      }
    });

    assert_eq!(patproj.pattern.layers.len(), 2);
    action.perform(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers.len(), 1);
  }

  // Test revoking the action.
  {
    window.once("layers:add", |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let bytes = base64::decode(base64).unwrap();
      let (index, layer): (u32, embroiderly_pattern::Layer) = borsh::from_slice(&bytes).unwrap();
      assert_eq!(index, 0);
      assert_eq!(layer.name, "Layer 2");
    });
    window.once("app:pattern-changed", {
      let id = patproj.id.to_string();
      move |e| {
        assert_eq!(serde_json::from_str::<String>(e.payload()).unwrap(), id);
      }
    });

    assert_eq!(patproj.pattern.layers.len(), 1);
    action.revoke(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers.len(), 2);
    assert_eq!(patproj.pattern.layers[0].name, "Layer 2");
  }
}
