use embroiderly_pattern::{PatternInfo, PatternProject};
use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindowBuilder, generate_context};

use super::{Action, UpdatePatternInfoAction};
use crate::utils::base64;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

#[test]
fn test_update_pattern_info() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();
  let pattern_info = PatternInfo {
    title: "Test Pattern".to_string(),
    author: "Nazar Antoniuk".to_string(),
    copyright: "(c) Embroiderly".to_string(),
    description: "This is a test pattern".to_string(),
  };
  let action = UpdatePatternInfoAction::new(pattern_info.clone());

  // Test executing the command.
  {
    let event_id = window.listen("pattern-info:update", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: PatternInfo = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected, pattern_info);
    });

    action.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the command.
  {
    window.listen("pattern-info:update", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: PatternInfo = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected, PatternInfo::default());
    });

    action.revoke(&window, &mut patproj).unwrap();
  }
}
