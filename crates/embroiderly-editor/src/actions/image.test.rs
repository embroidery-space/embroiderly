use embroiderly_pattern::{EmbroiderlyProject, ReferenceImage, ReferenceImageSettings};

use crate::actions::ImageAction;
use crate::{EditorAction, EditorEvent};

#[test]
fn test_set_reference_image() {
  let mut embproj = EmbroiderlyProject::default();

  let image1 = ReferenceImage {
    format: image::ImageFormat::Png,
    content: vec![0, 1, 2, 3, 4],
    settings: Default::default(),
  };
  let mut action1 = EditorAction::Image(ImageAction::SetReferenceImage {
    image: Some(image1.clone()),
    old_image: None,
  });

  let image2 = ReferenceImage {
    format: image::ImageFormat::Png,
    content: vec![4, 3, 2, 1, 0],
    settings: Default::default(),
  };
  let mut action2 = EditorAction::Image(ImageAction::SetReferenceImage {
    image: Some(image2.clone()),
    old_image: None,
  });

  // Test executing the first action.
  {
    let events = action1.perform(&mut embproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &Some(image1.clone()));

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test executing the second action.
  {
    let events = action2.perform(&mut embproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &Some(image2.clone()));

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the second action.
  {
    let events = action2.revoke(&mut embproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &Some(image1.clone()));

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the first action.
  {
    let events = action1.revoke(&mut embproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &None);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}

#[test]
fn test_remove_reference_image() {
  let mut embproj = EmbroiderlyProject::default();

  let image = ReferenceImage {
    format: image::ImageFormat::Png,
    content: vec![0, 1, 2, 3, 4],
    settings: Default::default(),
  };
  embproj.reference_image = Some(image.clone());

  let mut action = EditorAction::Image(ImageAction::SetReferenceImage {
    image: None,
    old_image: None,
  });

  // Test executing the action.
  {
    let events = action.perform(&mut embproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &None);
    assert_eq!(embproj.reference_image, None);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the action.
  {
    let events = action.revoke(&mut embproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &Some(image.clone()));
    assert_eq!(embproj.reference_image, Some(image));

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}

#[test]
fn test_update_reference_image_settings() {
  let mut embproj = EmbroiderlyProject::default();

  let image = ReferenceImage {
    format: image::ImageFormat::Png,
    content: vec![0, 1, 2, 3, 4],
    settings: Default::default(),
  };
  embproj.reference_image = Some(image.clone());

  let new_settings = ReferenceImageSettings {
    x: 10.0,
    y: 20.0,
    width: 100.0,
    height: 200.0,
    rotation: 45.0,
    opacity: 0.5,
  };
  let mut action = EditorAction::Image(ImageAction::UpdateSettings {
    settings: new_settings,
    old_settings: None,
  });

  // Test executing the action.
  {
    let events = action.perform(&mut embproj).unwrap();
    let EditorEvent::ImageSettingsUpdate(s) = &events[0] else {
      panic!("expected ImageSettingsUpdate");
    };
    assert_eq!(s, &new_settings);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the action.
  {
    let old_settings = image.settings;
    let events = action.revoke(&mut embproj).unwrap();
    let EditorEvent::ImageSettingsUpdate(s) = &events[0] else {
      panic!("expected ImageSettingsUpdate");
    };
    assert_eq!(s, &old_settings);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}
