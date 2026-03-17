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

fn half_stitch(x: f32, y: f32, palindex: u32, direction: PartStitchDirection) -> Stitch {
  Stitch::Part(PartStitch {
    x: NotNan::new(x).unwrap(),
    y: NotNan::new(y).unwrap(),
    palindex,
    direction,
    kind: PartStitchKind::Half,
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

#[test]
fn creates_pattern_with_default_layer() {
  let pattern = Pattern::default();

  assert_eq!(pattern.layers_count(), 1);
  assert_eq!(pattern.layers[0].name, "Default");
}

#[test]
fn adds_new_layer() {
  let mut pattern = Pattern::default();

  let index = pattern.add_layer(Layer::new("Layer 2"));

  assert_eq!(index, 1);
  assert_eq!(pattern.layers_count(), 2);
  assert_eq!(pattern.layers[1].name, "Layer 2");
}

#[test]
fn removes_layer() {
  let mut pattern = Pattern::default();
  pattern.add_layer(Layer::new("Layer 2"));

  let removed = pattern.remove_layer(1);

  assert_eq!(removed.name, "Layer 2");
  assert_eq!(pattern.layers_count(), 1);
}

#[test]
#[should_panic(expected = "cannot remove the last layer")]
fn panics_when_removing_last_layer() {
  let mut pattern = Pattern::default();

  pattern.remove_layer(0);
}

#[test]
fn moves_layer_from_end_to_beginning() {
  let mut pattern = Pattern::default();
  pattern.add_layer(Layer::new("Layer 2"));
  pattern.add_layer(Layer::new("Layer 3"));

  pattern.move_layer(2, 0);

  assert_eq!(pattern.layers[0].name, "Layer 3");
  assert_eq!(pattern.layers[1].name, "Default");
  assert_eq!(pattern.layers[2].name, "Layer 2");
}

#[test]
fn moves_layer_from_beginning_to_end() {
  let mut pattern = Pattern::default();
  pattern.add_layer(Layer::new("Layer 2"));
  pattern.add_layer(Layer::new("Layer 3"));

  pattern.move_layer(0, 2);

  assert_eq!(pattern.layers[0].name, "Layer 2");
  assert_eq!(pattern.layers[1].name, "Layer 3");
  assert_eq!(pattern.layers[2].name, "Default");
}

#[test]
fn aggregates_full_stitch_counts_across_layers() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0));
  pattern.add_stitch(0, full_stitch(1.0, 0.0, 0));
  pattern.add_layer(Layer::new("Layer 2"));
  pattern.add_stitch(1, full_stitch(2.0, 0.0, 0));

  let (full, petite) = pattern.full_stitches_number();

  assert_eq!(full, 3);
  assert_eq!(petite, 0);
}

#[test]
fn aggregates_part_stitch_counts_across_layers() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, half_stitch(0.0, 0.0, 0, PartStitchDirection::Forward));
  pattern.add_layer(Layer::new("Layer 2"));
  pattern.add_stitch(1, half_stitch(1.0, 0.0, 0, PartStitchDirection::Backward));

  let (half, quarter) = pattern.part_stitches_number();

  assert_eq!(half, 2);
  assert_eq!(quarter, 0);
}

#[test]
fn adds_stitch_to_specified_layer() {
  let mut pattern = Pattern::default();
  pattern.add_layer(Layer::new("Layer 2"));

  pattern.add_stitch(1, full_stitch(0.0, 0.0, 0));

  assert!(pattern.layers[0].fullstitches.is_empty());
  assert_eq!(pattern.layers[1].fullstitches.len(), 1);
}

#[test]
fn removes_stitch_from_specified_layer() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0));

  let removed = pattern.remove_stitch(0, full_stitch(0.0, 0.0, 0));

  assert!(removed.is_some());
  assert!(pattern.layers[0].fullstitches.is_empty());
}

#[test]
fn checks_stitch_containment_in_specified_layer() {
  let mut pattern = Pattern::default();
  pattern.add_layer(Layer::new("Layer 2"));
  pattern.add_stitch(1, french_knot(5.0, 5.0, 0));

  assert!(!pattern.contains_stitch(0, &french_knot(5.0, 5.0, 0)));
  assert!(pattern.contains_stitch(1, &french_knot(5.0, 5.0, 0)));
}

#[test]
fn removes_stitches_by_palindexes_across_all_layers() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0));
  pattern.add_stitch(0, full_stitch(1.0, 0.0, 1));
  pattern.add_layer(Layer::new("Layer 2"));
  pattern.add_stitch(1, full_stitch(2.0, 0.0, 1));

  let removed = pattern.remove_stitches_by_palindexes(&[1]);

  assert_eq!(removed.len(), 2);
  assert_eq!(pattern.layers[0].fullstitches.len(), 1);
  assert!(pattern.layers[1].fullstitches.is_empty());
}

#[test]
fn restores_stitches_reindexing_all_layers() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0));
  pattern.add_stitch(0, full_stitch(1.0, 0.0, 1));
  pattern.add_layer(Layer::new("Layer 2"));
  pattern.add_stitch(1, full_stitch(2.0, 0.0, 0));
  pattern.add_stitch(1, full_stitch(3.0, 0.0, 1));

  let stitches_to_restore = vec![full_stitch(10.0, 0.0, 1)];
  pattern.restore_stitches(0, stitches_to_restore, &[1], 3);

  // Layer 1 (non-target) should have its palindexes reindexed.
  let layer1_stitches: Vec<_> = pattern.layers[1].fullstitches.iter().collect();
  assert_eq!(layer1_stitches[0].palindex, 0);
  assert_eq!(layer1_stitches[1].palindex, 2);

  // Layer 0 (target) should have reindexed stitches + the restored stitch.
  assert_eq!(pattern.layers[0].fullstitches.len(), 3);
  let layer0_stitches: Vec<_> = pattern.layers[0].fullstitches.iter().collect();
  assert_eq!(layer0_stitches[0].palindex, 0);
  assert_eq!(layer0_stitches[1].palindex, 2);
  assert_eq!(layer0_stitches[2].palindex, 1);
}

#[test]
fn removes_stitches_outside_bounds_from_all_layers() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0));
  pattern.add_stitch(0, full_stitch(5.0, 5.0, 0));
  pattern.add_layer(Layer::new("Layer 2"));
  pattern.add_stitch(1, full_stitch(1.0, 1.0, 0));
  pattern.add_stitch(1, full_stitch(6.0, 6.0, 0));

  let removed = pattern.remove_stitches_outside_bounds(Bounds::new(5, 5, 10, 10));

  assert_eq!(removed.len(), 2);
  assert_eq!(pattern.layers[0].fullstitches.len(), 1);
  assert_eq!(pattern.layers[1].fullstitches.len(), 1);
}
