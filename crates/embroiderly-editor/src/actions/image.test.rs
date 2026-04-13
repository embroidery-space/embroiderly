use embroiderly_pattern::{PatternProject, ReferenceImage, ReferenceImageSettings};

use crate::actions::ImageAction;
use crate::{EditorAction, EditorEvent};

#[test]
fn test_set_reference_image() {
  let mut patproj = PatternProject::default();

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
    let events = action1.perform(&mut patproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &Some(image1.clone()));

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test executing the second action.
  {
    let events = action2.perform(&mut patproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &Some(image2.clone()));

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the second action.
  {
    let events = action2.revoke(&mut patproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &Some(image1.clone()));

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the first action.
  {
    let events = action1.revoke(&mut patproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &None);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }
}

#[test]
fn test_remove_reference_image() {
  let mut patproj = PatternProject::default();

  let image = ReferenceImage {
    format: image::ImageFormat::Png,
    content: vec![0, 1, 2, 3, 4],
    settings: Default::default(),
  };
  patproj.reference_image = Some(image.clone());

  let mut action = EditorAction::Image(ImageAction::SetReferenceImage {
    image: None,
    old_image: None,
  });

  // Test executing the action.
  {
    let events = action.perform(&mut patproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &None);
    assert_eq!(patproj.reference_image, None);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the action.
  {
    let events = action.revoke(&mut patproj).unwrap();
    let EditorEvent::ImageSet(img) = &events[0] else {
      panic!("expected ImageSet");
    };
    assert_eq!(img, &Some(image.clone()));
    assert_eq!(patproj.reference_image, Some(image));

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }
}

#[test]
fn test_update_reference_image_settings() {
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
    opacity: 0.5,
  };
  let mut action = EditorAction::Image(ImageAction::UpdateSettings {
    settings: new_settings,
    old_settings: None,
  });

  // Test executing the action.
  {
    let events = action.perform(&mut patproj).unwrap();
    let EditorEvent::ImageSettingsUpdate(s) = &events[0] else {
      panic!("expected ImageSettingsUpdate");
    };
    assert_eq!(s, &new_settings);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the action.
  {
    let old_settings = image.settings;
    let events = action.revoke(&mut patproj).unwrap();
    let EditorEvent::ImageSettingsUpdate(s) = &events[0] else {
      panic!("expected ImageSettingsUpdate");
    };
    assert_eq!(s, &old_settings);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }
}
