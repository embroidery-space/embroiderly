use embroiderly_pattern::*;

use crate::actions::StitchAction;
use crate::{EditorAction, EditorEvent};

fn create_pattern_project() -> EmbroiderlyProject {
  let mut embproj = EmbroiderlyProject::default();

  // top-left petite
  embproj.pattern.layers[0].fullstitches.insert(FullStitch {
    x: Coord::new(0.0).unwrap(),
    y: Coord::new(0.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Petite,
  });
  // top-right quarter
  embproj.pattern.layers[0].partstitches.insert(PartStitch {
    x: Coord::new(0.5).unwrap(),
    y: Coord::new(0.0).unwrap(),
    palindex: 0,
    kind: PartStitchKind::Quarter,
    direction: PartStitchDirection::Forward,
  });
  // bottom-left petite
  embproj.pattern.layers[0].fullstitches.insert(FullStitch {
    x: Coord::new(0.0).unwrap(),
    y: Coord::new(0.5).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Petite,
  });
  // bottom-right quarter
  embproj.pattern.layers[0].partstitches.insert(PartStitch {
    x: Coord::new(0.5).unwrap(),
    y: Coord::new(0.5).unwrap(),
    palindex: 0,
    kind: PartStitchKind::Quarter,
    direction: PartStitchDirection::Backward,
  });

  embproj
}

#[test]
fn test_add_stitch_to_default_layer() {
  let mut embproj = create_pattern_project();
  let stitch = Stitch::Full(FullStitch {
    x: Coord::new(0.0).unwrap(),
    y: Coord::new(0.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Full,
  });
  let mut action = EditorAction::Stitch(StitchAction::Add {
    layer_index: 0,
    stitch,
    conflicts: None,
  });

  // Test executing the command.
  {
    let events = action.perform(&mut embproj).unwrap();
    let EditorEvent::StitchesAdd { layer_index, stitches } = &events[0] else {
      panic!("expected StitchesAdd");
    };
    assert_eq!(layer_index, &0);
    assert_eq!(stitches.len(), 1);
    assert_eq!(stitches[0], stitch);

    let EditorEvent::StitchesRemove { layer_index, stitches } = &events[1] else {
      panic!("expected StitchesRemove");
    };
    assert_eq!(layer_index, &0);
    assert_eq!(stitches.len(), 4);

    assert_eq!(embproj.pattern.layers[0].fullstitches.len(), 1);
    assert_eq!(embproj.pattern.layers[0].partstitches.len(), 0);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the command.
  {
    let events = action.revoke(&mut embproj).unwrap();
    let EditorEvent::StitchesRemove { layer_index, stitches } = &events[0] else {
      panic!("expected StitchesRemove");
    };
    assert_eq!(layer_index, &0);
    assert_eq!(stitches.len(), 1);
    assert_eq!(stitches[0], stitch);

    let EditorEvent::StitchesAdd { layer_index, stitches } = &events[1] else {
      panic!("expected StitchesAdd");
    };
    assert_eq!(layer_index, &0);
    assert_eq!(stitches.len(), 4);

    assert_eq!(embproj.pattern.layers[0].fullstitches.len(), 2);
    assert_eq!(embproj.pattern.layers[0].partstitches.len(), 2);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}

#[test]
fn test_add_stitch_to_custom_layer() {
  let mut embproj = create_pattern_project();
  embproj.pattern.layers.push(embroiderly_pattern::Layer::default()); // Adding a second layer.

  let stitch = Stitch::Full(FullStitch {
    x: Coord::new(1.0).unwrap(),
    y: Coord::new(1.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Full,
  });
  let mut action = EditorAction::Stitch(StitchAction::Add {
    layer_index: 1,
    stitch,
    conflicts: None,
  });

  let events = action.perform(&mut embproj).unwrap();
  let EditorEvent::StitchesAdd { layer_index, stitches } = &events[0] else {
    panic!("expected StitchesAdd");
  };
  assert_eq!(layer_index, &1);
  assert_eq!(stitches.len(), 1);
  assert_eq!(stitches[0], stitch);

  let EditorEvent::StitchesRemove { layer_index, stitches } = &events[1] else {
    panic!("expected StitchesRemove");
  };
  assert_eq!(layer_index, &1);
  assert_eq!(stitches.len(), 0);

  // Layer 0 (default) must be untouched.
  assert_eq!(embproj.pattern.layers[0].fullstitches.len(), 2);
  assert_eq!(embproj.pattern.layers[0].partstitches.len(), 2);
  // Layer 1 (custom) must contain the new stitch.
  assert_eq!(embproj.pattern.layers[1].fullstitches.len(), 1);

  assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
}

#[test]
fn test_remove_stitch() {
  let mut embproj = create_pattern_project();
  let stitch = Stitch::Full(FullStitch {
    x: Coord::new(0.0).unwrap(),
    y: Coord::new(0.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Petite,
  });
  let mut action = EditorAction::Stitch(StitchAction::Remove {
    layer_index: 0,
    target_stitch: stitch,
    actual_stitch: None,
  });

  // Test executing the command.
  {
    let events = action.perform(&mut embproj).unwrap();
    let EditorEvent::StitchesRemove { layer_index, stitches } = &events[0] else {
      panic!("expected StitchesRemove");
    };
    assert_eq!(layer_index, &0);
    assert_eq!(stitches.len(), 1);
    assert_eq!(stitches[0], stitch);
    assert_eq!(embproj.pattern.layers[0].fullstitches.len(), 1);
    assert_eq!(embproj.pattern.layers[0].partstitches.len(), 2);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the command.
  {
    let events = action.revoke(&mut embproj).unwrap();
    let EditorEvent::StitchesAdd { layer_index, stitches } = &events[0] else {
      panic!("expected StitchesAdd");
    };
    assert_eq!(layer_index, &0);
    assert_eq!(stitches.len(), 1);
    assert_eq!(stitches[0], stitch);
    assert_eq!(embproj.pattern.layers[0].fullstitches.len(), 2);
    assert_eq!(embproj.pattern.layers[0].partstitches.len(), 2);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}
