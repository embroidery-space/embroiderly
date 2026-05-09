use embroiderly_pattern::{DisplayMode, DisplaySettings, PatternProject};

use crate::actions::DisplayAction;
use crate::{EditorAction, EditorEvent};

#[test]
fn test_update_display_settings() {
  let mut patproj = PatternProject::default();

  let old_display_settings = patproj.display_settings.clone();
  let new_display_settings = DisplaySettings {
    display_mode: DisplayMode::Stitches,
    show_symbols: true,
    show_grid: false,
    show_rulers: false,
    ..old_display_settings.clone()
  };
  let mut action = EditorAction::Display(DisplayAction::Update {
    display_settings: new_display_settings.clone(),
    old_display_settings: None,
  });

  // Test executing the action.
  {
    let events = action.perform(&mut patproj).unwrap();
    let EditorEvent::DisplayUpdate(settings) = &events[0] else {
      panic!("expected DisplayUpdate");
    };
    assert_eq!(settings, &new_display_settings);
    assert_eq!(patproj.display_settings, new_display_settings);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the action.
  {
    let events = action.revoke(&mut patproj).unwrap();
    let EditorEvent::DisplayUpdate(settings) = &events[0] else {
      panic!("expected DisplayUpdate");
    };
    assert_eq!(settings, &old_display_settings);
    assert_eq!(patproj.display_settings, old_display_settings);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }
}
