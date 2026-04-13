use embroiderly_pattern::{PatternInfo, PatternProject};

use crate::actions::PatternAction;
use crate::{EditorAction, EditorEvent};

#[test]
fn test_update_pattern_info() {
  let mut patproj = PatternProject::default();
  let pattern_info = PatternInfo {
    title: "Test Pattern".to_string(),
    author: "Nazar Antoniuk".to_string(),
    copyright: "(c) Embroiderly".to_string(),
    description: "This is a test pattern".to_string(),
  };
  let mut action = EditorAction::Pattern(PatternAction::UpdateInfo {
    info: pattern_info.clone(),
    old_info: None,
  });

  // Test executing the command.
  {
    let events = action.perform(&mut patproj).unwrap();
    let EditorEvent::PatternInfoUpdate(info) = &events[0] else {
      panic!("expected PatternInfoUpdate");
    };
    assert_eq!(info, &pattern_info);
    assert_eq!(patproj.pattern.info, pattern_info);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the command.
  {
    let events = action.revoke(&mut patproj).unwrap();
    let EditorEvent::PatternInfoUpdate(info) = &events[0] else {
      panic!("expected PatternInfoUpdate");
    };
    assert_eq!(info, &PatternInfo::default());
    assert_eq!(patproj.pattern.info, PatternInfo::default());

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }
}
