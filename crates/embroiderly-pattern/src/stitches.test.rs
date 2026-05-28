use std::sync::LazyLock;

use ordered_float::NotNan;

use super::*;

static TEST_FULLSTITCHES: LazyLock<Stitches<FullStitch>> = LazyLock::new(|| {
  Stitches::from_iter([
    FullStitch {
      x: NotNan::new(0.0).unwrap(),
      y: NotNan::new(0.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: NotNan::new(1.0).unwrap(),
      y: NotNan::new(1.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Petite,
    },
    FullStitch {
      x: NotNan::new(1.5).unwrap(),
      y: NotNan::new(1.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Petite,
    },
    FullStitch {
      x: NotNan::new(1.0).unwrap(),
      y: NotNan::new(1.5).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Petite,
    },
    FullStitch {
      x: NotNan::new(1.5).unwrap(),
      y: NotNan::new(1.5).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Petite,
    },
  ])
});

static TEST_PARTSTITCHES: LazyLock<Stitches<PartStitch>> = LazyLock::new(|| {
  Stitches::from_iter([
    PartStitch {
      x: NotNan::new(0.0).unwrap(),
      y: NotNan::new(0.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: NotNan::new(0.0).unwrap(),
      y: NotNan::new(0.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: NotNan::new(1.0).unwrap(),
      y: NotNan::new(1.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: NotNan::new(1.5).unwrap(),
      y: NotNan::new(1.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: NotNan::new(1.0).unwrap(),
      y: NotNan::new(1.5).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: NotNan::new(1.5).unwrap(),
      y: NotNan::new(1.5).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
  ])
});

static TEST_LINES: LazyLock<Stitches<LineStitch>> = LazyLock::new(|| {
  Stitches::from_iter([
    LineStitch {
      x: (NotNan::new(0.0).unwrap(), NotNan::new(1.0).unwrap()),
      y: (NotNan::new(0.0).unwrap(), NotNan::new(1.0).unwrap()),
      palindex: 0,
      kind: LineStitchKind::Back,
    },
    LineStitch {
      x: (NotNan::new(1.0).unwrap(), NotNan::new(2.0).unwrap()),
      y: (NotNan::new(1.0).unwrap(), NotNan::new(2.0).unwrap()),
      palindex: 0,
      kind: LineStitchKind::Straight,
    },
  ])
});

static TEST_NODES: LazyLock<Stitches<NodeStitch>> = LazyLock::new(|| {
  Stitches::from_iter([
    NodeStitch {
      x: NotNan::new(0.0).unwrap(),
      y: NotNan::new(0.0).unwrap(),
      rotated: false,
      palindex: 0,
      kind: NodeStitchKind::FrenchKnot,
    },
    NodeStitch {
      x: NotNan::new(1.0).unwrap(),
      y: NotNan::new(1.0).unwrap(),
      rotated: false,
      palindex: 0,
      kind: NodeStitchKind::Bead,
    },
  ])
});

fn full(base: NotNan<f32>) -> FullStitch {
  FullStitch {
    x: base,
    y: base,
    palindex: 0,
    kind: FullStitchKind::Full,
  }
}

fn petites(base: NotNan<f32>) -> [FullStitch; 4] {
  [
    FullStitch {
      x: base,
      y: base,
      palindex: 0,
      kind: FullStitchKind::Petite,
    },
    FullStitch {
      x: NotNan::new(base + 0.5).unwrap(),
      y: base,
      palindex: 0,
      kind: FullStitchKind::Petite,
    },
    FullStitch {
      x: base,
      y: NotNan::new(base + 0.5).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Petite,
    },
    FullStitch {
      x: NotNan::new(base + 0.5).unwrap(),
      y: NotNan::new(base + 0.5).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Petite,
    },
  ]
}

fn halves(base: NotNan<f32>) -> [PartStitch; 2] {
  [
    PartStitch {
      x: base,
      y: base,
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: base,
      y: base,
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Half,
    },
  ]
}

fn quarters(base: NotNan<f32>) -> [PartStitch; 4] {
  [
    PartStitch {
      x: base,
      y: base,
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: NotNan::new(base + 0.5).unwrap(),
      y: base,
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: base,
      y: NotNan::new(base + 0.5).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: NotNan::new(base + 0.5).unwrap(),
      y: NotNan::new(base + 0.5).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
  ]
}

fn line(base: NotNan<f32>, kind: LineStitchKind) -> LineStitch {
  LineStitch {
    x: (base, NotNan::new(base + 1.0).unwrap()),
    y: (base, NotNan::new(base + 1.0).unwrap()),
    palindex: 0,
    kind,
  }
}

fn node(base: NotNan<f32>, kind: NodeStitchKind) -> NodeStitch {
  NodeStitch {
    x: base,
    y: base,
    rotated: false,
    palindex: 0,
    kind,
  }
}

fn special(x: f32, y: f32, rotation: u16, modindex: u32) -> SpecialStitch {
  SpecialStitch {
    x: NotNan::new(x).unwrap(),
    y: NotNan::new(y).unwrap(),
    rotation,
    flip: (false, false),
    palindex: 0,
    modindex,
  }
}

fn special_stitch_model(width: f32, height: f32) -> SpecialStitchModel {
  SpecialStitchModel {
    unique_name: "test".to_string(),
    name: "Test".to_string(),
    width,
    height,
    nodestitches: vec![],
    linestitches: vec![],
    curvedstitches: vec![],
  }
}

#[test]
fn new_stitches_should_not_conflict() {
  let fullstitch = full(NotNan::new(10.0).unwrap());
  assert!(TEST_FULLSTITCHES.get(&fullstitch).is_none());
  assert_eq!(
    TEST_FULLSTITCHES
      .clone()
      .remove_conflicts_with_full_stitch(&fullstitch)
      .len(),
    0
  );
  assert_eq!(
    TEST_PARTSTITCHES
      .clone()
      .remove_conflicts_with_full_stitch(&fullstitch)
      .len(),
    0
  );

  for petite in petites(NotNan::new(10.0).unwrap()) {
    assert!(TEST_FULLSTITCHES.clone().get(&petite).is_none());
    assert_eq!(
      TEST_FULLSTITCHES
        .clone()
        .remove_conflicts_with_petite_stitch(&petite)
        .len(),
      0
    );
    assert_eq!(
      TEST_PARTSTITCHES
        .clone()
        .remove_conflicts_with_petite_stitch(&petite)
        .len(),
      0
    );
  }

  for half in halves(NotNan::new(10.0).unwrap()) {
    assert!(TEST_PARTSTITCHES.clone().get(&half).is_none());
    assert_eq!(
      TEST_FULLSTITCHES.clone().remove_conflicts_with_half_stitch(&half).len(),
      0
    );
    assert_eq!(
      TEST_PARTSTITCHES.clone().remove_conflicts_with_half_stitch(&half).len(),
      0
    );
  }

  for quarter in quarters(NotNan::new(10.0).unwrap()) {
    assert!(TEST_PARTSTITCHES.clone().get(&quarter).is_none());
    assert_eq!(
      TEST_FULLSTITCHES
        .clone()
        .remove_conflicts_with_quarter_stitch(&quarter)
        .len(),
      0
    );
    assert_eq!(
      TEST_PARTSTITCHES
        .clone()
        .remove_conflicts_with_quarter_stitch(&quarter)
        .len(),
      0
    );
  }

  let back = line(NotNan::new(10.0).unwrap(), LineStitchKind::Back);
  assert!(TEST_LINES.get(&back).is_none());

  let straight = line(NotNan::new(10.0).unwrap(), LineStitchKind::Straight);
  assert!(TEST_LINES.get(&straight).is_none());

  let frenchknot = node(NotNan::new(10.0).unwrap(), NodeStitchKind::FrenchKnot);
  assert!(TEST_NODES.get(&frenchknot).is_none());

  let bead = node(NotNan::new(10.0).unwrap(), NodeStitchKind::Bead);
  assert!(TEST_NODES.get(&bead).is_none());
}

#[test]
fn full_stitch_conflicts_with_full_stitch() {
  let fullstitch = full(NotNan::new(0.0).unwrap());
  assert!(TEST_FULLSTITCHES.clone().get(&fullstitch).is_some());
  assert_eq!(
    TEST_FULLSTITCHES
      .clone()
      .remove_conflicts_with_full_stitch(&fullstitch)
      .len(),
    0
  );
}

#[test]
fn full_stitch_conflicts_with_petite_stitches() {
  let fullstitch = full(NotNan::new(1.0).unwrap());
  assert!(TEST_FULLSTITCHES.clone().get(&fullstitch).is_none());
  assert_eq!(
    TEST_FULLSTITCHES
      .clone()
      .remove_conflicts_with_full_stitch(&fullstitch)
      .len(),
    4
  );
}

#[test]
fn full_stitch_conflicts_with_half_stitches() {
  let fullstitch = full(NotNan::new(0.0).unwrap());
  assert_eq!(
    TEST_PARTSTITCHES
      .clone()
      .remove_conflicts_with_full_stitch(&fullstitch)
      .len(),
    2
  );
}

#[test]
fn full_stitch_conflicts_with_quarter_stitches() {
  let fullstitch = full(NotNan::new(1.0).unwrap());
  assert_eq!(
    TEST_PARTSTITCHES
      .clone()
      .remove_conflicts_with_full_stitch(&fullstitch)
      .len(),
    4
  );
}

#[test]
fn petite_stitches_conflict_with_full_stitches() {
  for petite in petites(NotNan::new(0.0).unwrap()) {
    assert_eq!(
      TEST_FULLSTITCHES
        .clone()
        .remove_conflicts_with_petite_stitch(&petite)
        .len(),
      1
    );
  }
}

#[test]
fn petite_stitches_conflict_with_petite_stitches() {
  for petite in petites(NotNan::new(1.0).unwrap()) {
    assert!(TEST_FULLSTITCHES.clone().get(&petite).is_some());
    assert_eq!(
      TEST_FULLSTITCHES
        .clone()
        .remove_conflicts_with_petite_stitch(&petite)
        .len(),
      0
    );
  }
}

#[test]
fn petite_stitches_conflict_with_half_stitches() {
  for petite in petites(NotNan::new(0.0).unwrap()) {
    assert_eq!(
      TEST_PARTSTITCHES
        .clone()
        .remove_conflicts_with_petite_stitch(&petite)
        .len(),
      1
    );
  }
}

#[test]
fn petite_stitches_conflict_with_quarter_stitches() {
  for petite in petites(NotNan::new(1.0).unwrap()) {
    assert_eq!(
      TEST_PARTSTITCHES
        .clone()
        .remove_conflicts_with_petite_stitch(&petite)
        .len(),
      1
    );
  }
}

#[test]
fn half_stitches_conflict_with_full_stitches() {
  for half in halves(NotNan::new(0.0).unwrap()) {
    assert_eq!(
      TEST_FULLSTITCHES.clone().remove_conflicts_with_half_stitch(&half).len(),
      1
    );
  }
}

#[test]
fn half_stitches_conflict_with_petite_stitches() {
  for half in halves(NotNan::new(1.0).unwrap()) {
    assert_eq!(
      TEST_FULLSTITCHES.clone().remove_conflicts_with_half_stitch(&half).len(),
      2
    );
  }
}

#[test]
fn half_stitches_conflict_with_half_stitches() {
  for half in halves(NotNan::new(0.0).unwrap()) {
    assert!(TEST_PARTSTITCHES.clone().get(&half).is_some());
  }
}

#[test]
fn half_stitches_conflict_with_quarter_stitches() {
  for half in halves(NotNan::new(1.0).unwrap()) {
    assert_eq!(
      TEST_PARTSTITCHES.clone().remove_conflicts_with_half_stitch(&half).len(),
      2
    );
  }
}

#[test]
fn quarter_stitches_conflict_with_full_stitches() {
  for quarter in quarters(NotNan::new(0.0).unwrap()) {
    assert_eq!(
      TEST_FULLSTITCHES
        .clone()
        .remove_conflicts_with_quarter_stitch(&quarter)
        .len(),
      1
    );
  }
}

#[test]
fn quarter_stitches_conflict_with_petite_stitches() {
  for quarter in quarters(NotNan::new(1.0).unwrap()) {
    assert_eq!(
      TEST_FULLSTITCHES
        .clone()
        .remove_conflicts_with_quarter_stitch(&quarter)
        .len(),
      1
    );
  }
}

#[test]
fn quarter_stitches_conflict_with_half_stitches() {
  for quarter in quarters(NotNan::new(0.0).unwrap()) {
    assert_eq!(
      TEST_PARTSTITCHES
        .clone()
        .remove_conflicts_with_quarter_stitch(&quarter)
        .len(),
      1
    );
  }
}

#[test]
fn quarter_stitches_conflict_with_quarter_stitches() {
  for quarter in quarters(NotNan::new(1.0).unwrap()) {
    assert!(TEST_PARTSTITCHES.clone().get(&quarter).is_some());
  }
}

#[test]
fn line_conflicts_with_line() {
  let back = line(NotNan::new(0.0).unwrap(), LineStitchKind::Back);
  assert!(TEST_LINES.get(&back).is_some());
  let back = line(NotNan::new(1.0).unwrap(), LineStitchKind::Back);
  assert!(TEST_LINES.get(&back).is_some());

  let straight = line(NotNan::new(0.0).unwrap(), LineStitchKind::Straight);
  assert!(TEST_LINES.get(&straight).is_some());
  let straight = line(NotNan::new(1.0).unwrap(), LineStitchKind::Straight);
  assert!(TEST_LINES.get(&straight).is_some());
}

#[test]
fn node_conflicts_with_node() {
  let frenchknot = node(NotNan::new(0.0).unwrap(), NodeStitchKind::FrenchKnot);
  assert!(TEST_NODES.get(&frenchknot).is_some());
  let frenchknot = node(NotNan::new(1.0).unwrap(), NodeStitchKind::FrenchKnot);
  assert!(TEST_NODES.get(&frenchknot).is_some());

  let bead = node(NotNan::new(0.0).unwrap(), NodeStitchKind::Bead);
  assert!(TEST_NODES.get(&bead).is_some());
  let bead = node(NotNan::new(1.0).unwrap(), NodeStitchKind::Bead);
  assert!(TEST_NODES.get(&bead).is_some());
}

#[test]
fn test_reindex_palindexes() {
  let mut stitches = Stitches::from_iter([
    FullStitch {
      x: NotNan::new(0.0).unwrap(),
      y: NotNan::new(0.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: NotNan::new(1.0).unwrap(),
      y: NotNan::new(1.0).unwrap(),
      palindex: 1,
      kind: FullStitchKind::Full,
    },
  ]);

  // Restore one item at position [1]; current palette has 2 items.
  // Expected: palindex 0 stays 0, palindex 1 shifts to 2 (skipping the restored slot).
  stitches.reindex_palindexes(&[1], 2);

  // No stitches are inserted or removed — only indexes shift.
  assert_eq!(stitches.len(), 2);
  let all: Vec<_> = stitches.iter().collect();
  assert_eq!(all[0].palindex, 0);
  assert_eq!(all[1].palindex, 2);
}

#[test]
fn test_remove_stitches_by_palindexes() {
  let mut stitches = Stitches::from_iter([
    FullStitch {
      x: NotNan::new(0.0).unwrap(),
      y: NotNan::new(0.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: NotNan::new(1.0).unwrap(),
      y: NotNan::new(1.0).unwrap(),
      palindex: 1,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: NotNan::new(2.0).unwrap(),
      y: NotNan::new(2.0).unwrap(),
      palindex: 2,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: NotNan::new(3.0).unwrap(),
      y: NotNan::new(3.0).unwrap(),
      palindex: 3,
      kind: FullStitchKind::Full,
    },
  ]);

  let removed = stitches.remove_stitches_by_palindexes(&[1, 2]);

  // Check that the correct stitches were removed.
  assert_eq!(removed.len(), 2);
  assert!(removed.iter().any(|s| s.palindex == 1));
  assert!(removed.iter().any(|s| s.palindex == 2));

  // Check that the remaining stitches have updated palindex values.
  assert_eq!(stitches.len(), 2);
  let remaining: Vec<_> = stitches.iter().collect();
  assert_eq!(remaining[0].palindex, 0); // palindex 0 stays as 0.
  assert_eq!(remaining[1].palindex, 1); // palindex 3 becomes 1.
}

#[test]
fn test_restore_stitches() {
  let mut stitches = Stitches::from_iter([
    FullStitch {
      x: NotNan::new(0.0).unwrap(),
      y: NotNan::new(0.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: NotNan::new(3.0).unwrap(),
      y: NotNan::new(3.0).unwrap(),
      palindex: 1,
      kind: FullStitchKind::Full,
    },
  ]);

  let stitches_to_restore = vec![
    FullStitch {
      x: NotNan::new(1.0).unwrap(),
      y: NotNan::new(1.0).unwrap(),
      palindex: 1,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: NotNan::new(2.0).unwrap(),
      y: NotNan::new(2.0).unwrap(),
      palindex: 2,
      kind: FullStitchKind::Full,
    },
  ];

  stitches.restore_stitches(stitches_to_restore, &[1, 2], 4);

  // Check that all stitches are present with correct palindex values.
  assert_eq!(stitches.len(), 4);
  let all_stitches: Vec<_> = stitches.iter().collect();
  assert_eq!(all_stitches[0].palindex, 0);
  assert_eq!(all_stitches[1].palindex, 1);
  assert_eq!(all_stitches[2].palindex, 2);
  assert_eq!(all_stitches[3].palindex, 3);
}

#[test]
fn test_remove_fullstitches_outside_bounds() {
  let mut stitches = Stitches::from_iter([
    FullStitch {
      x: NotNan::new(0.0).unwrap(),
      y: NotNan::new(0.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: NotNan::new(5.0).unwrap(),
      y: NotNan::new(5.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: NotNan::new(10.0).unwrap(),
      y: NotNan::new(10.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: NotNan::new(15.0).unwrap(),
      y: NotNan::new(5.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Full,
    },
  ]);

  let bounds = Bounds::new(5, 5, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds);

  // Check that stitches outside bounds were removed.
  assert_eq!(stitches.len(), 2);
  assert_eq!(removed.len(), 2);
  assert!(removed[0].x == 0.0 && removed[0].y == 0.0);
  assert!(removed[1].x == 15.0 && removed[1].y == 5.0);
}

#[test]
fn test_remove_fullstitches_outside_bounds_with_petites() {
  let mut stitches = Stitches::from_iter([
    FullStitch {
      x: NotNan::new(5.0).unwrap(),
      y: NotNan::new(5.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Full,
    },
    FullStitch {
      x: NotNan::new(5.5).unwrap(),
      y: NotNan::new(5.5).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Petite,
    },
    FullStitch {
      x: NotNan::new(20.0).unwrap(),
      y: NotNan::new(20.0).unwrap(),
      palindex: 0,
      kind: FullStitchKind::Petite,
    },
  ]);

  let bounds = Bounds::new(0, 0, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds);

  // Check that petite outside bounds was removed.
  assert_eq!(stitches.len(), 2);
  assert_eq!(removed.len(), 1);
  assert!(removed[0].x == 20.0 && removed[0].y == 20.0);
  assert_eq!(removed[0].kind, FullStitchKind::Petite);
}

#[test]
fn test_remove_partstitches_outside_bounds() {
  let mut stitches = Stitches::from_iter([
    PartStitch {
      x: NotNan::new(0.0).unwrap(),
      y: NotNan::new(0.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: NotNan::new(5.0).unwrap(),
      y: NotNan::new(5.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: NotNan::new(10.0).unwrap(),
      y: NotNan::new(10.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: NotNan::new(15.0).unwrap(),
      y: NotNan::new(5.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Quarter,
    },
  ]);

  let bounds = Bounds::new(5, 5, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds);

  // Check that stitches outside bounds were removed.
  assert_eq!(stitches.len(), 2);
  assert_eq!(removed.len(), 2);
  assert!(removed[0].x == 0.0 && removed[0].y == 0.0);
  assert!(removed[1].x == 15.0 && removed[1].y == 5.0);
}

#[test]
fn test_remove_partstitches_boundary_cases() {
  let mut stitches = Stitches::from_iter([
    PartStitch {
      x: NotNan::new(4.5).unwrap(),
      y: NotNan::new(5.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: NotNan::new(5.0).unwrap(),
      y: NotNan::new(5.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
    PartStitch {
      x: NotNan::new(14.5).unwrap(),
      y: NotNan::new(14.5).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Forward,
      kind: PartStitchKind::Quarter,
    },
    PartStitch {
      x: NotNan::new(15.0).unwrap(),
      y: NotNan::new(15.0).unwrap(),
      palindex: 0,
      direction: PartStitchDirection::Backward,
      kind: PartStitchKind::Half,
    },
  ]);

  let bounds = Bounds::new(5, 5, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds);

  // Check boundary behavior: x < bounds.x OR x >= (bounds.x + bounds.width)
  assert_eq!(stitches.len(), 2);
  assert_eq!(removed.len(), 2);
  assert!(removed[0].x == 4.5);
  assert!(removed[1].x == 15.0);
}

#[test]
fn test_remove_linestitches_outside_bounds() {
  let mut stitches = Stitches::from_iter([
    LineStitch {
      x: (NotNan::new(0.0).unwrap(), NotNan::new(1.0).unwrap()),
      y: (NotNan::new(0.0).unwrap(), NotNan::new(1.0).unwrap()),
      palindex: 0,
      kind: LineStitchKind::Back,
    },
    LineStitch {
      x: (NotNan::new(5.0).unwrap(), NotNan::new(6.0).unwrap()),
      y: (NotNan::new(5.0).unwrap(), NotNan::new(6.0).unwrap()),
      palindex: 0,
      kind: LineStitchKind::Straight,
    },
    LineStitch {
      x: (NotNan::new(10.0).unwrap(), NotNan::new(11.0).unwrap()),
      y: (NotNan::new(10.0).unwrap(), NotNan::new(11.0).unwrap()),
      palindex: 0,
      kind: LineStitchKind::Back,
    },
    LineStitch {
      x: (NotNan::new(20.0).unwrap(), NotNan::new(21.0).unwrap()),
      y: (NotNan::new(20.0).unwrap(), NotNan::new(21.0).unwrap()),
      palindex: 0,
      kind: LineStitchKind::Straight,
    },
  ]);

  let bounds = Bounds::new(5, 5, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds);

  // Check that line stitches outside bounds were removed.
  assert_eq!(stitches.len(), 2);
  assert_eq!(removed.len(), 2);
  assert!(removed[0].x.0 == 0.0);
  assert!(removed[1].x.0 == 20.0);
}

#[test]
fn test_remove_linestitches_partial_bounds() {
  let mut stitches = Stitches::from_iter([
    LineStitch {
      x: (NotNan::new(3.0).unwrap(), NotNan::new(7.0).unwrap()),
      y: (NotNan::new(3.0).unwrap(), NotNan::new(7.0).unwrap()),
      palindex: 0,
      kind: LineStitchKind::Back,
    },
    LineStitch {
      x: (NotNan::new(7.0).unwrap(), NotNan::new(20.0).unwrap()),
      y: (NotNan::new(7.0).unwrap(), NotNan::new(20.0).unwrap()),
      palindex: 0,
      kind: LineStitchKind::Straight,
    },
  ]);

  let bounds = Bounds::new(5, 5, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds);

  // Check that line stitches partially outside bounds were removed.
  assert_eq!(removed.len(), 2);
  assert_eq!(stitches.len(), 0);
}

#[test]
fn test_remove_nodestitches_outside_bounds() {
  let mut stitches = Stitches::from_iter([
    NodeStitch {
      x: NotNan::new(0.0).unwrap(),
      y: NotNan::new(0.0).unwrap(),
      rotated: false,
      palindex: 0,
      kind: NodeStitchKind::FrenchKnot,
    },
    NodeStitch {
      x: NotNan::new(5.0).unwrap(),
      y: NotNan::new(5.0).unwrap(),
      rotated: false,
      palindex: 0,
      kind: NodeStitchKind::Bead,
    },
    NodeStitch {
      x: NotNan::new(10.0).unwrap(),
      y: NotNan::new(10.0).unwrap(),
      rotated: true,
      palindex: 0,
      kind: NodeStitchKind::FrenchKnot,
    },
    NodeStitch {
      x: NotNan::new(15.0).unwrap(),
      y: NotNan::new(5.0).unwrap(),
      rotated: false,
      palindex: 0,
      kind: NodeStitchKind::Bead,
    },
  ]);

  let bounds = Bounds::new(5, 5, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds);

  // Check that node stitches outside bounds were removed.
  assert_eq!(stitches.len(), 2);
  assert_eq!(removed.len(), 2);
  assert!(removed[0].x == 0.0 && removed[0].y == 0.0);
  assert!(removed[1].x == 15.0 && removed[1].y == 5.0);
}

#[test]
fn test_remove_nodestitches_all_outside_bounds() {
  let mut stitches = Stitches::from_iter([
    NodeStitch {
      x: NotNan::new(0.0).unwrap(),
      y: NotNan::new(0.0).unwrap(),
      rotated: false,
      palindex: 0,
      kind: NodeStitchKind::FrenchKnot,
    },
    NodeStitch {
      x: NotNan::new(20.0).unwrap(),
      y: NotNan::new(20.0).unwrap(),
      rotated: true,
      palindex: 0,
      kind: NodeStitchKind::Bead,
    },
  ]);

  let bounds = Bounds::new(5, 5, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds);

  // All stitches should be removed.
  assert_eq!(stitches.len(), 0);
  assert_eq!(removed.len(), 2);
}

#[test]
fn test_remove_nodestitches_all_inside_bounds() {
  let mut stitches = Stitches::from_iter([
    NodeStitch {
      x: NotNan::new(5.0).unwrap(),
      y: NotNan::new(5.0).unwrap(),
      rotated: false,
      palindex: 0,
      kind: NodeStitchKind::FrenchKnot,
    },
    NodeStitch {
      x: NotNan::new(10.0).unwrap(),
      y: NotNan::new(10.0).unwrap(),
      rotated: true,
      palindex: 0,
      kind: NodeStitchKind::Bead,
    },
  ]);

  let bounds = Bounds::new(5, 5, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds);

  // No stitches should be removed.
  assert_eq!(stitches.len(), 2);
  assert_eq!(removed.len(), 0);
}

#[test]
fn test_remove_specialstitches_fully_inside() {
  let models = vec![special_stitch_model(2.0, 2.0)];
  let mut stitches = Stitches::from_iter([special(5.0, 5.0, 0, 0)]);

  let bounds = Bounds::new(0, 0, 20, 20);
  let removed = stitches.remove_stitches_outside_bounds(bounds, &models);

  assert_eq!(stitches.len(), 1);
  assert_eq!(removed.len(), 0);
}

#[test]
fn test_remove_specialstitches_anchor_outside() {
  let models = vec![special_stitch_model(2.0, 2.0)];
  let mut stitches = Stitches::from_iter([special(15.0, 15.0, 0, 0)]);

  let bounds = Bounds::new(0, 0, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds, &models);

  assert_eq!(stitches.len(), 0);
  assert_eq!(removed.len(), 1);
}

#[test]
fn test_remove_specialstitches_partial_overlap() {
  let models = vec![special_stitch_model(4.0, 4.0)];
  let mut stitches = Stitches::from_iter([special(8.0, 8.0, 0, 0)]);

  let bounds = Bounds::new(0, 0, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds, &models);

  assert_eq!(stitches.len(), 0);
  assert_eq!(removed.len(), 1);
}

#[test]
fn test_remove_specialstitches_rotation_90() {
  let models = vec![special_stitch_model(4.0, 2.0)];
  let mut stitches = Stitches::from_iter([SpecialStitch {
    x: NotNan::new(8.0).unwrap(),
    y: NotNan::new(0.0).unwrap(),
    rotation: 90,
    flip: (false, false),
    palindex: 0,
    modindex: 0,
  }]);

  let bounds = Bounds::new(0, 0, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds, &models);

  assert_eq!(stitches.len(), 1);
  assert_eq!(removed.len(), 0);
}

#[test]
fn test_remove_specialstitches_rotation_180_pushes_outside() {
  let models = vec![special_stitch_model(4.0, 4.0)];
  let mut stitches = Stitches::from_iter([SpecialStitch {
    x: NotNan::new(0.0).unwrap(),
    y: NotNan::new(0.0).unwrap(),
    rotation: 180,
    flip: (false, false),
    palindex: 0,
    modindex: 0,
  }]);

  let bounds = Bounds::new(0, 0, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds, &models);

  assert_eq!(stitches.len(), 0);
  assert_eq!(removed.len(), 1);
}

#[test]
fn test_remove_specialstitches_flip_inside() {
  let models = vec![special_stitch_model(2.0, 2.0)];

  for &(fx, fy) in &[(false, false), (true, false), (false, true), (true, true)] {
    let mut stitches = Stitches::from_iter([SpecialStitch {
      x: NotNan::new(5.0).unwrap(),
      y: NotNan::new(5.0).unwrap(),
      rotation: 0,
      flip: (fx, fy),
      palindex: 0,
      modindex: 0,
    }]);

    let bounds = Bounds::new(0, 0, 10, 10);
    let removed = stitches.remove_stitches_outside_bounds(bounds, &models);

    assert_eq!(stitches.len(), 1);
    assert_eq!(removed.len(), 0);
  }
}

#[test]
fn test_remove_specialstitches_flip_x_pushes_outside() {
  let models = vec![special_stitch_model(2.0, 2.0)];
  let mut stitches = Stitches::from_iter([SpecialStitch {
    x: NotNan::new(1.0).unwrap(),
    y: NotNan::new(5.0).unwrap(),
    rotation: 0,
    flip: (true, false),
    palindex: 0,
    modindex: 0,
  }]);

  let bounds = Bounds::new(0, 0, 10, 10);
  let removed = stitches.remove_stitches_outside_bounds(bounds, &models);

  assert_eq!(stitches.len(), 0);
  assert_eq!(removed.len(), 1);
}
