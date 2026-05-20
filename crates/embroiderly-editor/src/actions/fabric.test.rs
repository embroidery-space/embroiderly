use embroiderly_pattern::{EmbroiderlyProject, Fabric};

use crate::actions::FabricAction;
use crate::{EditorAction, EditorEvent};

#[test]
fn test_update_fabric() {
  let mut embproj = EmbroiderlyProject::default();
  let fabric = Fabric {
    width: 100,
    height: 100,
    spi: (16, 16),
    name: String::from("Light Mocha"),
    color: String::from("DAC9B6"),
    kind: String::from("Aida"),
  };
  let mut action = EditorAction::Fabric(FabricAction::Update {
    fabric: fabric.clone(),
    old_fabric: None,
    extra_stitches: None,
  });

  // Test executing the command.
  {
    let events = action.perform(&mut embproj).unwrap();
    let EditorEvent::FabricUpdate(f) = &events[0] else {
      panic!("expected FabricUpdate");
    };
    assert_eq!(f, &fabric);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the command.
  {
    let events = action.revoke(&mut embproj).unwrap();
    let EditorEvent::FabricUpdate(f) = &events[0] else {
      panic!("expected FabricUpdate");
    };
    assert_eq!(f, &Fabric::default());

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}
