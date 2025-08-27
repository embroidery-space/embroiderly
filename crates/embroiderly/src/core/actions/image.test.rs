use embroiderly_pattern::{PatternProject, ReferenceImage, ReferenceImageSettings};
use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindowBuilder, generate_context};

use super::{Action, SetReferenceImageAction, UpdateReferenceImageSettingsAction};
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
    settings: Default::default(),
  };
  let action1 = SetReferenceImageAction::new(Some(image1.clone()));

  let image2 = ReferenceImage {
    format: image::ImageFormat::Png,
    content: vec![4, 3, 2, 1, 0],
    settings: Default::default(),
  };
  let action2 = SetReferenceImageAction::new(Some(image2.clone()));

  // Test executing the first action.
  {
    let image = image1.clone();
    let event_id = window.listen("image:set", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: Option<ReferenceImage> = borsh::from_slice(&base64::decode(&str).unwrap()).unwrap();
      assert_eq!(expected, Some(image.clone()));
    });

    action1.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test executing the second action.
  {
    let image = image2.clone();
    let event_id = window.listen("image:set", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: Option<ReferenceImage> = borsh::from_slice(&base64::decode(&str).unwrap()).unwrap();
      assert_eq!(expected, Some(image.clone()));
    });

    action2.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the second action.
  {
    let image = image1.clone();
    let event_id = window.listen("image:set", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: Option<ReferenceImage> = borsh::from_slice(&base64::decode(&str).unwrap()).unwrap();
      assert_eq!(expected, Some(image.clone()));
    });

    action2.revoke(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the first action.
  {
    let event_id = window.listen("image:set", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: Option<ReferenceImage> = borsh::from_slice(&base64::decode(&str).unwrap()).unwrap();
      assert_eq!(expected, None);
    });

    action1.revoke(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }
}

#[test]
fn test_remove_reference_image() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();

  let image = ReferenceImage {
    format: image::ImageFormat::Png,
    content: vec![0, 1, 2, 3, 4],
    settings: Default::default(),
  };
  patproj.reference_image = Some(image.clone());

  let action = SetReferenceImageAction::new(None);

  // Test executing the action.
  {
    let event_id = window.listen("image:set", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: Option<ReferenceImage> = borsh::from_slice(&base64::decode(&str).unwrap()).unwrap();
      assert_eq!(expected, None);
    });

    action.perform(&window, &mut patproj).unwrap();
    assert_eq!(patproj.reference_image, None);
    window.unlisten(event_id);
  }

  // Test revoking the action.
  {
    let original_image = image.clone();
    let event_id = window.listen("image:set", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: Option<ReferenceImage> = borsh::from_slice(&base64::decode(&str).unwrap()).unwrap();
      assert_eq!(expected, Some(original_image.clone()));
    });

    action.revoke(&window, &mut patproj).unwrap();
    assert_eq!(patproj.reference_image, Some(image));
    window.unlisten(event_id);
  }
}

#[test]
fn test_update_reference_image_settings() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();

  let image = ReferenceImage {
    format: image::ImageFormat::Png,
    content: vec![0, 1, 2, 3, 4],
    settings: Default::default(),
  };
  patproj.reference_image = Some(image.clone());

  let new_settings = ReferenceImageSettings {
    x: 10.0,
    y: 20.0,
    width: 100.0,
    height: 200.0,
    rotation: 45.0,
  };
  let action = UpdateReferenceImageSettingsAction::new(new_settings.clone());

  // Test executing the action.
  {
    let event_id = window.listen("image:settings:update", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: ReferenceImageSettings = borsh::from_slice(&base64::decode(&str).unwrap()).unwrap();
      assert_eq!(expected, new_settings);
    });

    action.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the action.
  {
    let old_settings = image.settings.clone();
    let event_id = window.listen("image:settings:update", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: ReferenceImageSettings = borsh::from_slice(&base64::decode(&str).unwrap()).unwrap();
      assert_eq!(expected, old_settings);
    });

    action.revoke(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }
}
