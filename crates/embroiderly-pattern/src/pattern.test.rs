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

fn quarter_stitch(x: f32, y: f32, palindex: u32, direction: PartStitchDirection) -> Stitch {
  Stitch::Part(PartStitch {
    x: NotNan::new(x).unwrap(),
    y: NotNan::new(y).unwrap(),
    palindex,
    direction,
    kind: PartStitchKind::Quarter,
  })
}

fn special_stitch(x: f32, y: f32, palindex: u32, modindex: u32) -> SpecialStitch {
  SpecialStitch {
    x: NotNan::new(x).unwrap(),
    y: NotNan::new(y).unwrap(),
    rotation: 0,
    flip: (false, false),
    palindex,
    modindex,
  }
}

#[test]
fn creates_pattern_with_default_layer() {
  let pattern = Pattern::default();

  assert_eq!(pattern.layers.len(), 1);
  assert!(pattern.layers[0].name.is_empty());
}

#[test]
fn aggregates_full_stitch_counts_across_layers() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0));
  pattern.add_stitch(0, full_stitch(1.0, 0.0, 0));
  let layer2_idx = pattern.layers.push(Layer::new("Layer 2"));
  pattern.add_stitch(layer2_idx, full_stitch(2.0, 0.0, 0));

  let (full, petite) = pattern.full_stitches_number();

  assert_eq!(full, 3);
  assert_eq!(petite, 0);
}

#[test]
fn aggregates_part_stitch_counts_across_layers() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, half_stitch(0.0, 0.0, 0, PartStitchDirection::Forward));
  let layer2_idx = pattern.layers.push(Layer::new("Layer 2"));
  pattern.add_stitch(layer2_idx, half_stitch(1.0, 0.0, 0, PartStitchDirection::Backward));

  let (half, quarter) = pattern.part_stitches_number();

  assert_eq!(half, 2);
  assert_eq!(quarter, 0);
}

#[test]
fn adds_stitch_to_specified_layer() {
  let mut pattern = Pattern::default();
  let layer2_idx = pattern.layers.push(Layer::new("Layer 2"));

  pattern.add_stitch(layer2_idx, full_stitch(0.0, 0.0, 0));

  assert!(pattern.layers[0].fullstitches.is_empty()); // Default untouched
  assert_eq!(pattern.layers[layer2_idx].fullstitches.len(), 1);
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
fn removes_full_stitch_at_point() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, full_stitch(2.0, 3.0, 5));

  let removed = pattern.remove_stitches_at_point(0, 2.2, 3.2);

  assert_eq!(removed.len(), 1);
  assert_eq!(removed[0], full_stitch(2.0, 3.0, 5));
  assert!(pattern.layers[0].fullstitches.is_empty());
}

#[test]
fn removes_petite_stitch_at_point() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, petite_stitch(2.5, 3.0, 7));

  let removed = pattern.remove_stitches_at_point(0, 2.7, 3.2);

  assert_eq!(removed.len(), 1);
  assert_eq!(removed[0], petite_stitch(2.5, 3.0, 7));
  assert!(pattern.layers[0].fullstitches.is_empty());
}

#[test]
fn removes_backward_half_stitch_at_point() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, half_stitch(1.0, 1.0, 2, PartStitchDirection::Backward));

  let removed = pattern.remove_stitches_at_point(0, 1.2, 1.3);

  assert_eq!(removed.len(), 1);
  assert_eq!(removed[0], half_stitch(1.0, 1.0, 2, PartStitchDirection::Backward));
  assert!(pattern.layers[0].partstitches.is_empty());
}

#[test]
fn removes_forward_half_stitch_at_point() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, half_stitch(1.0, 1.0, 2, PartStitchDirection::Forward));

  let removed = pattern.remove_stitches_at_point(0, 1.2, 1.7);

  assert_eq!(removed.len(), 1);
  assert_eq!(removed[0], half_stitch(1.0, 1.0, 2, PartStitchDirection::Forward));
  assert!(pattern.layers[0].partstitches.is_empty());
}

#[test]
fn removes_quarter_stitch_at_point() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, quarter_stitch(0.5, 0.5, 4, PartStitchDirection::Backward));

  let removed = pattern.remove_stitches_at_point(0, 0.7, 0.8);

  assert_eq!(removed.len(), 1);
  assert_eq!(removed[0], quarter_stitch(0.5, 0.5, 4, PartStitchDirection::Backward));
  assert!(pattern.layers[0].partstitches.is_empty());
}

#[test]
fn removes_no_stitches_at_empty_point() {
  let mut pattern = Pattern::default();

  let removed = pattern.remove_stitches_at_point(0, 0.3, 0.3);

  assert!(removed.is_empty());
  assert!(pattern.layers[0].fullstitches.is_empty());
}

#[test]
fn checks_stitch_containment_in_specified_layer() {
  let mut pattern = Pattern::default();
  let layer2_idx = pattern.layers.push(Layer::new("Layer 2"));
  pattern.add_stitch(layer2_idx, french_knot(5.0, 5.0, 0));

  assert!(!pattern.contains_stitch(0, &french_knot(5.0, 5.0, 0)));
  assert!(pattern.contains_stitch(layer2_idx, &french_knot(5.0, 5.0, 0)));
}

#[test]
fn removes_stitches_by_palindexes_across_all_layers() {
  let mut pattern = Pattern::default();
  let layer2_idx = pattern.layers.push(Layer::new("Layer 2"));
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0)); // Default, palindex=0
  pattern.add_stitch(0, full_stitch(1.0, 0.0, 1)); // Default, palindex=1
  pattern.add_stitch(layer2_idx, full_stitch(2.0, 0.0, 1)); // Layer2, palindex=1

  let removed = pattern.remove_stitches_by_palindexes(&[1]);

  assert_eq!(removed.len(), 2);
  assert!(pattern.layers[layer2_idx].fullstitches.is_empty()); // Layer2: palindex=1 removed
  assert_eq!(pattern.layers[0].fullstitches.len(), 1); // Default: palindex=0 remains
}

#[test]
fn restores_stitches_reindexing_all_layers() {
  let mut pattern = Pattern::default();
  let layer2_idx = pattern.layers.push(Layer::new("Layer 2"));
  // Default (actual 0) is non-target.
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0));
  pattern.add_stitch(0, full_stitch(1.0, 0.0, 1));
  // Layer2 (actual 1) is target.
  pattern.add_stitch(layer2_idx, full_stitch(2.0, 0.0, 0));
  pattern.add_stitch(layer2_idx, full_stitch(3.0, 0.0, 1));

  let stitches_to_restore = vec![full_stitch(10.0, 0.0, 1)];
  pattern.restore_stitches(layer2_idx, stitches_to_restore, &[1], 3);

  // Default (non-target) should have its palindexes reindexed.
  let default_stitches: Vec<_> = pattern.layers[0].fullstitches.iter().collect();
  assert_eq!(default_stitches[0].palindex, 0);
  assert_eq!(default_stitches[1].palindex, 2);

  // Layer2 (target) should have reindexed stitches + the restored stitch.
  assert_eq!(pattern.layers[layer2_idx].fullstitches.len(), 3);
  let layer2_stitches: Vec<_> = pattern.layers[layer2_idx].fullstitches.iter().collect();
  assert_eq!(layer2_stitches[0].palindex, 0);
  assert_eq!(layer2_stitches[1].palindex, 2);
  assert_eq!(layer2_stitches[2].palindex, 1);
}

#[test]
fn removes_stitches_outside_bounds_from_all_layers() {
  let mut pattern = Pattern::default();
  let layer2_idx = pattern.layers.push(Layer::new("Layer 2"));
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0)); // Default - outside bounds
  pattern.add_stitch(0, full_stitch(5.0, 5.0, 0)); // Default - inside bounds
  pattern.add_stitch(layer2_idx, full_stitch(1.0, 1.0, 0)); // Layer2 - outside bounds
  pattern.add_stitch(layer2_idx, full_stitch(6.0, 6.0, 0)); // Layer2 - inside bounds

  let removed = pattern.remove_stitches_outside_bounds(Bounds::new(5, 5, 10, 10));

  assert_eq!(removed.len(), 2);
  assert_eq!(pattern.layers[layer2_idx].fullstitches.len(), 1); // Layer2: inside remains
  assert_eq!(pattern.layers[0].fullstitches.len(), 1); // Default: inside remains
}

#[test]
fn flatten_single_layer_includes_all_stitches() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0));
  pattern.add_stitch(0, half_stitch(1.0, 0.0, 0, PartStitchDirection::Forward));
  pattern.add_stitch(0, french_knot(2.0, 0.0, 0));
  pattern.add_stitch(0, back_stitch(0.0, 0.0, 1.0, 0.0, 0));

  let flat = pattern.flatten_visible_layers();

  assert_eq!(flat.fullstitches.len(), 1);
  assert_eq!(flat.partstitches.len(), 1);
  assert_eq!(flat.nodestitches.len(), 1);
  assert_eq!(flat.linestitches.len(), 1);
}

#[test]
fn flatten_two_layers_topmost_wins_at_same_position() {
  let mut pattern = Pattern::default();
  // Default (visual bottom): palindex 0 at (0, 0).
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0));
  // Layer 2 (visual top): palindex 1 at (0, 0).
  let layer2_idx = pattern.layers.push(Layer::new("Layer 2"));
  pattern.add_stitch(layer2_idx, full_stitch(0.0, 0.0, 1));

  let flat = pattern.flatten_visible_layers();

  assert_eq!(flat.fullstitches.len(), 1);
  assert_eq!(flat.fullstitches.iter().next().unwrap().palindex, 1);
}

#[test]
fn flatten_skips_hidden_layer() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0)); // Default (visible)
  let layer2_idx = pattern.layers.push({
    let mut layer = Layer::new("Layer 2");
    layer.visible = false;
    layer
  }); // Layer 2 (visual top, hidden)
  pattern.add_stitch(layer2_idx, full_stitch(1.0, 0.0, 0));

  let flat = pattern.flatten_visible_layers();

  assert_eq!(flat.fullstitches.len(), 1);
}

#[test]
fn flatten_respects_stitch_kind_visibility() {
  let mut pattern = Pattern::default();
  // Disable full stitches visibility but keep petite visible.
  pattern.layers[0].fullstitches_visible = false;
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0));
  pattern.add_stitch(0, petite_stitch(0.5, 0.0, 0));

  let flat = pattern.flatten_visible_layers();

  // Full stitches should be excluded, petite should be included.
  assert_eq!(flat.fullstitches.len(), 1);
  assert_eq!(flat.fullstitches.iter().next().unwrap().kind, FullStitchKind::Petite);
}

#[test]
fn flatten_non_conflicting_stitches_from_multiple_layers_all_appear() {
  let mut pattern = Pattern::default();
  pattern.add_stitch(0, full_stitch(0.0, 0.0, 0));
  let layer2_idx = pattern.layers.push(Layer::new("Layer 2"));
  pattern.add_stitch(layer2_idx, full_stitch(1.0, 0.0, 0));
  pattern.add_stitch(layer2_idx, full_stitch(2.0, 0.0, 0));

  let flat = pattern.flatten_visible_layers();

  assert_eq!(flat.fullstitches.len(), 3);
}

#[test]
fn flatten_top_layer_full_stitch_displaces_bottom_layer_part_stitches() {
  let mut pattern = Pattern::default();
  // Default (visual bottom): half stitches at (0, 0).
  pattern.add_stitch(0, half_stitch(0.0, 0.0, 0, PartStitchDirection::Forward));
  pattern.add_stitch(0, half_stitch(0.0, 0.0, 0, PartStitchDirection::Backward));
  // Layer 2 (visual top): full stitch at (0, 0) that conflicts with the half stitches.
  let layer2_idx = pattern.layers.push(Layer::new("Layer 2"));
  pattern.add_stitch(layer2_idx, full_stitch(0.0, 0.0, 1));

  let flat = pattern.flatten_visible_layers();

  // The full stitch from layer2 should have displaced the part stitches.
  assert_eq!(flat.fullstitches.len(), 1);
  assert_eq!(flat.partstitches.len(), 0);
}

#[test]
fn flatten_higher_layer_special_stitch_overrides_lower_at_same_position() {
  let mut pattern = Pattern::default();
  // Default (visual bottom): special stitch at (0, 0) with palindex 0.
  pattern.layers[0].specialstitches.insert(special_stitch(0.0, 0.0, 0, 0));
  // Layer 2 (visual top): special stitch at (0, 0) with palindex 1.
  let layer2_idx = pattern.layers.push(Layer::new("Layer 2"));
  pattern.layers[layer2_idx]
    .specialstitches
    .insert(special_stitch(0.0, 0.0, 1, 0));

  let flat = pattern.flatten_visible_layers();

  assert_eq!(flat.specialstitches.len(), 1);
  assert_eq!(flat.specialstitches.iter().next().unwrap().palindex, 1);
}
