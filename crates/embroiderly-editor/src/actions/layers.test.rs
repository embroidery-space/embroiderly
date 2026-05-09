use embroiderly_pattern::PatternProject;

use crate::actions::LayerAction;
use crate::actions::layers::LayerVisibility;
use crate::{EditorAction, EditorEvent};

fn create_pattern_project() -> PatternProject {
  PatternProject::new(Default::default())
}

#[test]
fn test_add_layer_action() {
  let mut patproj = create_pattern_project();
  let mut action = EditorAction::Layer(LayerAction::Add { added_index: None });

  // Test performing the action.
  {
    assert_eq!(patproj.pattern.layers.len(), 1);
    let events = action.perform(&mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers.len(), 2);
    assert_eq!(patproj.pattern.layers.positions(), &[1, 0]);

    let EditorEvent::LayerAdd { index, layer } = &events[0] else {
      panic!("expected LayerAdd");
    };
    assert_eq!(index, &1);
    assert_eq!(layer.name, "");

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the action.
  {
    assert_eq!(patproj.pattern.layers.len(), 2);
    let events = action.revoke(&mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers.len(), 1);

    let EditorEvent::LayerRemove(index) = &events[0] else {
      panic!("expected LayerRemove");
    };
    assert_eq!(index, &1);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }
}

#[test]
fn test_remove_layer_action() {
  let mut patproj = create_pattern_project();
  patproj.pattern.layers.push(embroiderly_pattern::Layer::new("Layer 2"));

  let mut action = EditorAction::Layer(LayerAction::Remove {
    layer_index: 1,
    removed_layer: None,
  });

  // Test performing the action.
  {
    assert_eq!(patproj.pattern.layers.len(), 2);
    let events = action.perform(&mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers.len(), 1);

    let EditorEvent::LayerRemove(index) = &events[0] else {
      panic!("expected LayerRemove");
    };
    assert_eq!(index, &1);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the action.
  {
    assert_eq!(patproj.pattern.layers.len(), 1);
    let events = action.revoke(&mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers.len(), 2);
    assert_eq!(patproj.pattern.layers[1].name, "Layer 2");

    let EditorEvent::LayerAdd { index, layer } = &events[0] else {
      panic!("expected LayerAdd");
    };
    assert_eq!(index, &1);
    assert_eq!(layer.name, "Layer 2");

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }
}

#[test]
fn test_rename_layer_action() {
  let mut patproj = create_pattern_project();
  let mut action = EditorAction::Layer(LayerAction::Rename {
    layer_index: 0,
    name: "My Layer".to_string(),
    old_name: None,
  });

  // Test performing the action.
  {
    assert_eq!(patproj.pattern.layers[0].name, "");
    let events = action.perform(&mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers[0].name, "My Layer");

    let EditorEvent::LayerRename { layer_index, name } = &events[0] else {
      panic!("expected LayerRename");
    };
    assert_eq!(layer_index, &0);
    assert_eq!(name, "My Layer");

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the action.
  {
    let events = action.revoke(&mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers[0].name, "");

    let EditorEvent::LayerRename { layer_index, name } = &events[0] else {
      panic!("expected LayerRename");
    };
    assert_eq!(layer_index, &0);
    assert_eq!(name, "");

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }
}

#[test]
fn test_update_layer_visibility_action() {
  let mut patproj = create_pattern_project();

  let new_visibility = LayerVisibility {
    visible: false,

    fullstitches_visible: false,
    petitestitches_visible: true,

    halfstitches_visible: true,
    quarterstitches_visible: true,

    backstitches_visible: true,
    straightstitches_visible: true,

    frenchknots_visible: true,
    beads_visible: true,

    specialstitches_visible: true,
  };

  let mut action = EditorAction::Layer(LayerAction::UpdateVisibility {
    layer_index: 0,
    visibility: new_visibility.clone(),
    old_visibility: None,
  });

  // Test performing the action.
  {
    assert!(patproj.pattern.layers[0].visible);
    let events = action.perform(&mut patproj).unwrap();
    assert!(!patproj.pattern.layers[0].visible);
    assert!(!patproj.pattern.layers[0].fullstitches_visible);

    let EditorEvent::LayerUpdateVisibility {
      layer_index,
      visibility,
    } = &events[0]
    else {
      panic!("expected LayerUpdateVisibility");
    };
    assert_eq!(layer_index, &0);
    assert!(!visibility.visible);
    assert!(!visibility.fullstitches_visible);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the action.
  {
    let events = action.revoke(&mut patproj).unwrap();
    assert!(patproj.pattern.layers[0].visible);
    assert!(patproj.pattern.layers[0].fullstitches_visible);

    let EditorEvent::LayerUpdateVisibility {
      layer_index,
      visibility,
    } = &events[0]
    else {
      panic!("expected LayerUpdateVisibility");
    };
    assert_eq!(layer_index, &0);
    assert!(visibility.visible);
    assert!(visibility.fullstitches_visible);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }
}

#[test]
fn test_move_layer_action() {
  let mut patproj = create_pattern_project();
  patproj.pattern.layers.push(embroiderly_pattern::Layer::new("Layer A"));

  let mut action = EditorAction::Layer(LayerAction::Move {
    old_position: 0,
    new_position: 1,
    old_positions: None,
  });

  // Test performing the action.
  {
    let events = action.perform(&mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers.positions(), &[0, 1]);

    let EditorEvent::LayerMove(positions) = &events[0] else {
      panic!("expected LayerMove");
    };
    assert_eq!(positions, &[0, 1]);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }

  // Test revoking the action.
  {
    let events = action.revoke(&mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers.positions(), &[1, 0]);

    let EditorEvent::LayerMove(positions) = &events[0] else {
      panic!("expected LayerMove");
    };
    assert_eq!(positions, &[1, 0]);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == patproj.id));
  }
}
