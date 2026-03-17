use ordered_float::NotNan;

use super::*;

fn full_stitch(x: f32, y: f32, palindex: u32) -> Stitch {
  Stitch::Full(FullStitch {
    x: NotNan::new(x).unwrap(),
    y: NotNan::new(y).unwrap(),
    palindex,
    kind: FullStitchKind::Full,
  })
}

fn petite_stitch(x: f32, y: f32, palindex: u32) -> Stitch {
  Stitch::Full(FullStitch {
    x: NotNan::new(x).unwrap(),
    y: NotNan::new(y).unwrap(),
    palindex,
    kind: FullStitchKind::Petite,
  })
}

fn half_stitch(x: f32, y: f32, palindex: u32, direction: PartStitchDirection) -> Stitch {
  Stitch::Part(PartStitch {
    x: NotNan::new(x).unwrap(),
    y: NotNan::new(y).unwrap(),
    palindex,
    direction,
    kind: PartStitchKind::Half,
  })
}

fn quarter_stitch(x: f32, y: f32, palindex: u32, direction: PartStitchDirection) -> Stitch {
  Stitch::Part(PartStitch {
    x: NotNan::new(x).unwrap(),
    y: NotNan::new(y).unwrap(),
    palindex,
    direction,
    kind: PartStitchKind::Quarter,
  })
}

fn back_stitch(x1: f32, y1: f32, x2: f32, y2: f32, palindex: u32) -> Stitch {
  Stitch::Line(LineStitch {
    x: (NotNan::new(x1).unwrap(), NotNan::new(x2).unwrap()),
    y: (NotNan::new(y1).unwrap(), NotNan::new(y2).unwrap()),
    palindex,
    kind: LineStitchKind::Back,
  })
}

fn french_knot(x: f32, y: f32, palindex: u32) -> Stitch {
  Stitch::Node(NodeStitch {
    x: NotNan::new(x).unwrap(),
    y: NotNan::new(y).unwrap(),
    rotated: false,
    palindex,
    kind: NodeStitchKind::FrenchKnot,
  })
}

fn bead_stitch(x: f32, y: f32, palindex: u32) -> Stitch {
  Stitch::Node(NodeStitch {
    x: NotNan::new(x).unwrap(),
    y: NotNan::new(y).unwrap(),
    rotated: false,
    palindex,
    kind: NodeStitchKind::Bead,
  })
}

#[test]
fn creates_default_layer() {
  let layer = Layer::default();

  assert_eq!(layer.name, "Default");
  assert!(layer.visible);

  assert!(layer.fullstitches.is_empty());
  assert!(layer.fullstitches_visible);
  assert!(layer.petitestitches_visible);

  assert!(layer.partstitches.is_empty());
  assert!(layer.halfstitches_visible);
  assert!(layer.quarterstitches_visible);

  assert!(layer.linestitches.is_empty());
  assert!(layer.backstitches_visible);
  assert!(layer.straightstitches_visible);

  assert!(layer.nodestitches.is_empty());
  assert!(layer.frenchknots_visible);
  assert!(layer.beads_visible);

  assert!(layer.specialstitches.is_empty());
  assert!(layer.specialstitches_visible);
}

#[test]
fn creates_layer_with_custom_name() {
  let layer = Layer::new("My Layer");

  assert_eq!(layer.name, "My Layer");
  assert!(layer.visible);
}

#[test]
fn returns_full_stitches_count() {
  let mut layer = Layer::default();
  layer.add_stitch(full_stitch(0.0, 0.0, 0));
  layer.add_stitch(full_stitch(1.0, 0.0, 0));
  layer.add_stitch(petite_stitch(2.0, 0.0, 0));

  let (full, petite) = layer.full_stitches_number();

  assert_eq!(full, 2);
  assert_eq!(petite, 1);
}

#[test]
fn returns_part_stitches_count() {
  let mut layer = Layer::default();
  layer.add_stitch(half_stitch(0.0, 0.0, 0, PartStitchDirection::Forward));
  layer.add_stitch(quarter_stitch(1.0, 0.0, 0, PartStitchDirection::Backward));
  layer.add_stitch(quarter_stitch(1.5, 0.0, 0, PartStitchDirection::Forward));

  let (half, quarter) = layer.part_stitches_number();

  assert_eq!(half, 1);
  assert_eq!(quarter, 2);
}

#[test]
fn returns_line_stitches_count() {
  let mut layer = Layer::default();
  layer.add_stitch(back_stitch(0.0, 0.0, 1.0, 1.0, 0));
  layer.add_stitch(Stitch::Line(LineStitch {
    x: (NotNan::new(1.0).unwrap(), NotNan::new(2.0).unwrap()),
    y: (NotNan::new(1.0).unwrap(), NotNan::new(2.0).unwrap()),
    palindex: 0,
    kind: LineStitchKind::Straight,
  }));

  let (back, straight) = layer.line_stitches_number();

  assert_eq!(back, 1);
  assert_eq!(straight, 1);
}

#[test]
fn returns_node_stitches_count() {
  let mut layer = Layer::default();
  layer.add_stitch(french_knot(0.0, 0.0, 0));
  layer.add_stitch(bead_stitch(1.0, 1.0, 0));
  layer.add_stitch(bead_stitch(2.0, 2.0, 0));

  let (knots, beads) = layer.node_stitches_number();

  assert_eq!(knots, 1);
  assert_eq!(beads, 2);
}

#[test]
fn adds_full_stitch_removing_petites() {
  let mut layer = Layer::default();
  layer.add_stitch(petite_stitch(1.0, 1.0, 0));
  layer.add_stitch(petite_stitch(1.5, 1.0, 0));
  layer.add_stitch(petite_stitch(1.0, 1.5, 0));
  layer.add_stitch(petite_stitch(1.5, 1.5, 0));

  let conflicts = layer.add_stitch(full_stitch(1.0, 1.0, 1));

  assert_eq!(conflicts.len(), 4);
  assert_eq!(layer.fullstitches.len(), 1);
}

#[test]
fn adds_full_stitch_removing_halves() {
  let mut layer = Layer::default();
  layer.add_stitch(half_stitch(1.0, 1.0, 0, PartStitchDirection::Forward));
  layer.add_stitch(half_stitch(1.0, 1.0, 0, PartStitchDirection::Backward));

  let conflicts = layer.add_stitch(full_stitch(1.0, 1.0, 1));

  assert_eq!(conflicts.len(), 2);
  assert_eq!(layer.fullstitches.len(), 1);
  assert!(layer.partstitches.is_empty());
}

#[test]
fn adds_petite_stitch_removing_full() {
  let mut layer = Layer::default();
  layer.add_stitch(full_stitch(2.0, 2.0, 0));

  let conflicts = layer.add_stitch(petite_stitch(2.0, 2.0, 1));

  assert_eq!(conflicts.len(), 1);
  assert_eq!(layer.fullstitches.len(), 1);
}

#[test]
fn adds_petite_stitch_removing_quarter() {
  let mut layer = Layer::default();
  layer.add_stitch(quarter_stitch(2.0, 2.0, 0, PartStitchDirection::Backward));

  let conflicts = layer.add_stitch(petite_stitch(2.0, 2.0, 1));

  assert_eq!(conflicts.len(), 1);
  assert_eq!(layer.fullstitches.len(), 1);
  assert!(layer.partstitches.is_empty());
}

#[test]
fn adds_half_stitch_removing_petites_on_diagonal() {
  let mut layer = Layer::default();
  layer.add_stitch(petite_stitch(0.5, 0.0, 0));
  layer.add_stitch(petite_stitch(0.0, 0.5, 0));

  let conflicts = layer.add_stitch(half_stitch(0.0, 0.0, 1, PartStitchDirection::Forward));

  assert_eq!(conflicts.len(), 2);
  assert!(layer.fullstitches.is_empty());
}

#[test]
fn adds_quarter_stitch_removing_full() {
  let mut layer = Layer::default();
  layer.add_stitch(full_stitch(3.0, 3.0, 0));

  let conflicts = layer.add_stitch(quarter_stitch(3.0, 3.0, 1, PartStitchDirection::Backward));

  assert_eq!(conflicts.len(), 1);
  assert!(layer.fullstitches.is_empty());
  assert_eq!(layer.partstitches.len(), 1);
}

#[test]
fn adds_node_stitch_replacing_existing() {
  let mut layer = Layer::default();
  layer.add_stitch(french_knot(0.0, 0.0, 0));

  let conflicts = layer.add_stitch(french_knot(0.0, 0.0, 1));

  assert_eq!(conflicts.len(), 1);
  assert_eq!(conflicts[0], french_knot(0.0, 0.0, 0));
  assert_eq!(layer.nodestitches.len(), 1);
}

#[test]
fn adds_line_stitch_replacing_existing() {
  let mut layer = Layer::default();
  layer.add_stitch(back_stitch(0.0, 0.0, 1.0, 1.0, 0));

  let conflicts = layer.add_stitch(back_stitch(0.0, 0.0, 1.0, 1.0, 1));

  assert_eq!(conflicts.len(), 1);
  assert_eq!(layer.linestitches.len(), 1);
}

#[test]
fn returns_stitch() {
  let mut layer = Layer::default();
  let target_stitch = full_stitch(5.0, 5.0, 0);
  let nonexistent_stitch = full_stitch(99.0, 99.0, 0);

  layer.add_stitch(target_stitch.clone());

  assert_eq!(layer.get_stitch(&target_stitch), Some(target_stitch));
  assert!(layer.get_stitch(&nonexistent_stitch).is_none());
}

#[test]
fn contains_stitch() {
  let mut layer = Layer::default();
  let target_stitch = french_knot(3.0, 3.0, 0);
  let nonexistent_stitch = french_knot(99.0, 99.0, 0);

  layer.add_stitch(target_stitch.clone());

  assert!(layer.contains_stitch(&target_stitch));
  assert!(!layer.contains_stitch(&nonexistent_stitch));
}

#[test]
fn removes_stitch() {
  let mut layer = Layer::default();
  let target_stitch = full_stitch(0.0, 0.0, 0);
  let nonexistent_stitch = full_stitch(99.0, 99.0, 0);

  layer.add_stitch(target_stitch.clone());

  assert_eq!(layer.remove_stitch(target_stitch), Some(full_stitch(0.0, 0.0, 0)));
  assert!(layer.fullstitches.is_empty());

  assert_eq!(layer.remove_stitch(nonexistent_stitch), None);
}

#[test]
fn removes_stitches_by_palindexes_across_collections() {
  let mut layer = Layer::default();
  layer.add_stitch(full_stitch(0.0, 0.0, 0));
  layer.add_stitch(full_stitch(1.0, 0.0, 1));
  layer.add_stitch(half_stitch(2.0, 0.0, 1, PartStitchDirection::Forward));
  layer.add_stitch(back_stitch(0.0, 0.0, 1.0, 1.0, 0));
  layer.add_stitch(french_knot(3.0, 0.0, 1));

  let removed = layer.remove_stitches_by_palindexes(&[1]);

  assert_eq!(removed.len(), 3);
  assert_eq!(layer.fullstitches.len(), 1);
  assert!(layer.partstitches.is_empty());
  assert_eq!(layer.linestitches.len(), 1);
  assert!(layer.nodestitches.is_empty());
}

#[test]
fn adds_and_removes_stitches_in_batch() {
  let mut layer = Layer::default();
  let stitches = vec![
    full_stitch(0.0, 0.0, 0),
    french_knot(1.0, 1.0, 0),
    back_stitch(2.0, 2.0, 3.0, 3.0, 0),
  ];

  layer.add_stitches(stitches.clone());

  assert_eq!(layer.fullstitches.len(), 1);
  assert_eq!(layer.nodestitches.len(), 1);
  assert_eq!(layer.linestitches.len(), 1);

  layer.remove_stitches(stitches);

  assert!(layer.fullstitches.is_empty());
  assert!(layer.nodestitches.is_empty());
  assert!(layer.linestitches.is_empty());
}
