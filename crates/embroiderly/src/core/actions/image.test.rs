use embroiderly_pattern::{PatternProject, ReferenceImage};
use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindowBuilder, generate_context};

use super::{Action, SetReferenceImageAction};
use crate::utils::base64;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

#[test]
fn test_set_reference_image() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();

  let image1 = ReferenceImage {
    format: image::ImageFormat::Png,
    content: vec![0, 1, 2, 3, 4],
  };
  let action1 = SetReferenceImageAction::new(image1.clone());

  let image2 = ReferenceImage {
    format: image::ImageFormat::Png,
    content: vec![4, 3, 2, 1, 0],
  };
  let action2 = SetReferenceImageAction::new(image2.clone());

  // Test executing the first action.
  {
    let image = image1.clone();
    let event_id = window.listen("image:set", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: ReferenceImage = borsh::from_slice(&base64::decode(&str).unwrap()).unwrap();
      assert_eq!(expected, image);
    });

    action1.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test executing the second action.
  {
    let image = image2.clone();
    let event_id = window.listen("image:set", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: ReferenceImage = borsh::from_slice(&base64::decode(&str).unwrap()).unwrap();
      assert_eq!(expected, image);
    });

    action2.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the second action.
  {
    let image = image1.clone();
    let event_id = window.listen("image:set", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: ReferenceImage = borsh::from_slice(&base64::decode(&str).unwrap()).unwrap();
      assert_eq!(expected, image);
    });

    action2.revoke(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the first action.
  {
    let event_id = window.listen("image:remove", move |e| {
      let expected: () = serde_json::from_str(e.payload()).unwrap();
      assert_eq!(expected, ());
    });

    action1.revoke(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }
}
