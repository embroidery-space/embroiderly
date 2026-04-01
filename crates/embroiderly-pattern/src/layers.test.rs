use super::*;

mod layers {
  use super::*;

  mod creation {
    use super::*;

    #[test]
    fn new_creates_empty_layers_collection() {
      let layers = Layers::new();

      assert_eq!(layers.len(), 0);
      assert!(layers.is_empty());
      assert_eq!(layers.positions(), &[]);
    }

    #[test]
    fn default_creates_layers_collection_with_one_default_layer() {
      let layers = Layers::default();

      assert_eq!(layers.len(), 1);
      assert_eq!(layers.positions(), &[0]);
      assert!(layers[0].name.is_empty());
    }

    #[test]
    fn new_with_layer_creates_layers_collection_with_given_layer() {
      let layers = Layers::new_with_layer(Layer::new("My Layer"));

      assert_eq!(layers.len(), 1);
      assert_eq!(layers.positions(), &[0]);
      assert_eq!(layers[0].name, "My Layer");
    }

    #[test]
    fn converts_layers_vec_into_layers_collection() {
      let items = vec![Layer::new("A"), Layer::new("B"), Layer::new("C")];
      let layers = Layers::from(items);

      assert_eq!(layers.len(), 3);
      assert_eq!(layers.positions(), &[0, 1, 2]);
    }
  }

  mod access {
    use super::*;

    #[test]
    fn returns_layer_at_valid_index() {
      let mut layers = Layers::default();
      layers.push(Layer::new("A"));

      assert!(layers.get(0).is_some_and(|l| l.name == ""));
      assert!(layers.get(1).is_some_and(|l| l.name == "A"));
    }

    #[test]
    fn return_none_at_invalid_index() {
      let layers = Layers::default();

      assert!(layers.get(1).is_none());
      assert!(layers.get(999).is_none());
    }

    #[test]
    fn returns_mutable_layer() {
      let mut layers = Layers::default();

      if let Some(layer) = layers.get_mut(0) {
        layer.name = "Modified".to_string();
      }

      assert!(layers.get(0).is_some_and(|l| l.name == "Modified"));
    }

    #[test]
    fn returns_layer_on_indexed_access() {
      let mut layers = Layers::default();
      layers.push(Layer::new("A"));

      assert_eq!(layers[0].name, "");
      assert_eq!(layers[1].name, "A");
    }

    #[test]
    fn returns_mutable_layer_on_mutable_indexed_access() {
      let mut layers = Layers::default();

      layers[0].name = "Modified".to_string();

      assert_eq!(layers[0].name, "Modified");
    }

    #[test]
    fn returns_layers_count() {
      let layers = Layers::new();
      assert_eq!(layers.len(), 0);
      assert!(layers.is_empty());

      let layers = Layers::default();
      assert_eq!(layers.len(), 1);
      assert!(!layers.is_empty());
    }
  }

  mod mutation {
    use super::*;

    #[test]
    fn adds_layers_in_correct_actual_and_visual_positions() {
      let mut layers = Layers::default();

      let index = layers.push(Layer::new("A"));
      assert_eq!(index, 1);
      assert_eq!(layers[1].name, "A");
      assert_eq!(layers.positions(), &[1, 0]);
      assert_eq!(layers.len(), 2);

      let index = layers.push(Layer::new("B"));
      assert_eq!(index, 2);
      assert_eq!(layers[2].name, "B");
      assert_eq!(layers.positions(), &[2, 1, 0]);
      assert_eq!(layers.len(), 3);
    }

    #[test]
    fn removes_layers_by_index() {
      let mut layers = Layers::default();
      layers.push(Layer::new("A"));
      layers.push(Layer::new("B"));

      layers.remove(1);

      assert_eq!(layers.len(), 2);
      assert_eq!(layers[0].name, "");
      assert_eq!(layers[1].name, "B");

      assert_eq!(layers.positions(), &[1, 0]);
    }

    #[test]
    #[should_panic(expected = "cannot remove the last layer")]
    fn panics_when_removing_last_layer() {
      let mut layers = Layers::default();
      layers.remove(0);
    }

    #[test]
    fn inserts_layer_at_specified_position() {
      let mut layers = Layers::default();

      layers.insert(0, Layer::new("Inserted"));

      assert_eq!(layers.len(), 2);
      assert_eq!(layers[0].name, "Inserted");
      assert_eq!(layers[1].name, "");
    }
  }

  mod ordering {
    use super::*;

    #[test]
    fn moves_layer_to_specified_position() {
      let mut layers = Layers::default();
      layers.push(Layer::new("A"));

      let new_pos = layers.move_layer(0, 1);

      assert_eq!(new_pos, vec![0, 1]);
      assert_eq!(layers.positions(), &[0, 1]);
    }

    #[test]
    fn does_nothing_when_moving_layer_to_same_position() {
      let mut layers = Layers::default();
      layers.push(Layer::new("A"));

      let new_pos = layers.move_layer(1, 1);

      assert_eq!(new_pos, vec![1, 0]);
      assert_eq!(layers.positions(), &[1, 0]);
    }

    #[test]
    fn moves_layer_from_end_to_beginning() {
      let mut layers = Layers::default();
      layers.push(Layer::new("A"));
      layers.push(Layer::new("B"));

      layers.move_layer(2, 0);

      assert_eq!(layers.positions(), &[0, 2, 1]);
    }

    #[test]
    fn sets_positions() {
      let mut layers = Layers::default();
      layers.push(Layer::new("A"));

      layers.set_positions(vec![0, 1]);

      assert_eq!(layers.positions(), &[0, 1]);
    }
  }

  mod iteration {
    use super::*;

    #[test]
    fn iterates_over_layers_in_actual_order() {
      let mut layers = Layers::default();
      layers.push(Layer::new("A"));
      layers.push(Layer::new("B"));

      let items: Vec<_> = layers.iter().collect();
      assert_eq!(items[0].name, "");
      assert_eq!(items[1].name, "A");
      assert_eq!(items[2].name, "B");
    }

    #[test]
    fn iterates_mutably_over_layers_in_actual_order() {
      let mut layers = Layers::default();
      layers.push(Layer::new("A"));
      layers.push(Layer::new("B"));

      let items: Vec<_> = layers.iter_mut().collect();
      assert_eq!(items[0].name, "");
      assert_eq!(items[1].name, "A");
      assert_eq!(items[2].name, "B");
    }
  }
}

mod layer {
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

  mod creation {
    use super::*;

    #[test]
    fn creates_default_layer() {
      let layer = Layer::default();

      assert!(layer.name.is_empty());
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
  }

  mod stitch_counts {
    use super::*;

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
  }

  mod add_stitch {
    use super::*;

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
  }

  mod stitch_ops {
    use super::*;

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
  }
}
