use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindowBuilder, generate_context};

use super::{Action, UpdateFabricPropertiesAction};
use crate::core::pattern::{Fabric, PatternProject};
use crate::utils::base64;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

#[test]
fn test_update_fabric() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();
  let fabric = Fabric {
    width: 100,
    height: 100,
    spi: (16, 16),
    name: String::from("Light Mocha"),
    color: String::from("DAC9B6"),
    kind: String::from("Aida"),
  };
  let action = UpdateFabricPropertiesAction::new(fabric.clone());

  // Test executing the command.
  {
    let event_id = window.listen("fabric:update", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: Fabric = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected, fabric);
    });

    action.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the command.
  {
    window.listen("fabric:update", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: Fabric = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected, Fabric::default());
    });

    action.revoke(&window, &mut patproj).unwrap();
  }
}
