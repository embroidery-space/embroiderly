use embroiderly_pattern::*;
use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindowBuilder, generate_context};

use super::{Action, AddStitchAction, RemoveStitchAction, StitchesEvent};
use crate::utils::base64;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

fn create_pattern_project() -> PatternProject {
  let mut patproj = PatternProject::default();

  // top-left petite
  patproj.pattern.layers[0].fullstitches.insert(FullStitch {
    x: Coord::new(0.0).unwrap(),
    y: Coord::new(0.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Petite,
  });
  // top-right quarter
  patproj.pattern.layers[0].partstitches.insert(PartStitch {
    x: Coord::new(0.5).unwrap(),
    y: Coord::new(0.0).unwrap(),
    palindex: 0,
    kind: PartStitchKind::Quarter,
    direction: PartStitchDirection::Forward,
  });
  // bottom-left petite
  patproj.pattern.layers[0].fullstitches.insert(FullStitch {
    x: Coord::new(0.0).unwrap(),
    y: Coord::new(0.5).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Petite,
  });
  // bottom-right quarter
  patproj.pattern.layers[0].partstitches.insert(PartStitch {
    x: Coord::new(0.5).unwrap(),
    y: Coord::new(0.5).unwrap(),
    palindex: 0,
    kind: PartStitchKind::Quarter,
    direction: PartStitchDirection::Backward,
  });

  patproj
}

fn decode_stitches_event(payload: &str) -> StitchesEvent {
  let base64: &str = serde_json::from_str(payload).unwrap();
  borsh::from_slice(&base64::decode(base64).unwrap()).unwrap()
}

#[test]
fn test_add_stitch_to_default_layer() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  let stitch = Stitch::Full(FullStitch {
    x: Coord::new(0.0).unwrap(),
    y: Coord::new(0.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Full,
  });
  let action = AddStitchAction::new(0, stitch);

  // Test executing the command.
  {
    window.once("stitches:add", move |e| {
      let event = decode_stitches_event(e.payload());
      assert_eq!(event.layer_index, 0);
      assert_eq!(event.stitches.len(), 1);
      assert_eq!(event.stitches[0], stitch);
    });
    window.once("stitches:remove", |e| {
      let event = decode_stitches_event(e.payload());
      assert_eq!(event.layer_index, 0);
      assert_eq!(event.stitches.len(), 4);
    });
    window.once("app:pattern-changed", {
      let id = patproj.id.to_string();
      move |e| {
        assert_eq!(serde_json::from_str::<String>(e.payload()).unwrap(), id);
      }
    });

    action.perform(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers[0].fullstitches.len(), 1);
    assert_eq!(patproj.pattern.layers[0].partstitches.len(), 0);
  }

  // Test revoking the command.
  {
    window.once("stitches:remove", move |e| {
      let event = decode_stitches_event(e.payload());
      assert_eq!(event.layer_index, 0);
      assert_eq!(event.stitches.len(), 1);
      assert_eq!(event.stitches[0], stitch);
    });
    window.once("stitches:add", |e| {
      let event = decode_stitches_event(e.payload());
      assert_eq!(event.layer_index, 0);
      assert_eq!(event.stitches.len(), 4);
    });
    window.once("app:pattern-changed", {
      let id = patproj.id.to_string();
      move |e| {
        assert_eq!(serde_json::from_str::<String>(e.payload()).unwrap(), id);
      }
    });

    action.revoke(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers[0].fullstitches.len(), 2);
    assert_eq!(patproj.pattern.layers[0].partstitches.len(), 2);
  }
}

#[test]
fn test_add_stitch_to_custom_layer() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  patproj.pattern.layers.push(embroiderly_pattern::Layer::default()); // Adding a second layer.

  let stitch = Stitch::Full(FullStitch {
    x: Coord::new(1.0).unwrap(),
    y: Coord::new(1.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Full,
  });
  let action = AddStitchAction::new(1, stitch);

  window.once("stitches:add", move |e| {
    let event = decode_stitches_event(e.payload());
    assert_eq!(event.layer_index, 1);
    assert_eq!(event.stitches.len(), 1);
    assert_eq!(event.stitches[0], stitch);
  });
  window.once("stitches:remove", |e| {
    let event = decode_stitches_event(e.payload());
    assert_eq!(event.layer_index, 1);
    assert_eq!(event.stitches.len(), 0);
  });

  action.perform(&window, &mut patproj).unwrap();

  // Layer 0 (default) must be untouched.
  assert_eq!(patproj.pattern.layers[0].fullstitches.len(), 2);
  assert_eq!(patproj.pattern.layers[0].partstitches.len(), 2);
  // Layer 1 (custom) must contain the new stitch.
  assert_eq!(patproj.pattern.layers[1].fullstitches.len(), 1);
}

#[test]
fn test_remove_stitch() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = create_pattern_project();
  let stitch = Stitch::Full(FullStitch {
    x: Coord::new(0.0).unwrap(),
    y: Coord::new(0.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Petite,
  });
  let action = RemoveStitchAction::new(0, stitch);

  // Test executing the command.
  {
    window.once("stitches:remove", move |e| {
      let event = decode_stitches_event(e.payload());
      assert_eq!(event.layer_index, 0);
      assert_eq!(event.stitches.len(), 1);
      assert_eq!(event.stitches[0], stitch);
    });
    window.once("app:pattern-changed", {
      let id = patproj.id.to_string();
      move |e| {
        assert_eq!(serde_json::from_str::<String>(e.payload()).unwrap(), id);
      }
    });

    action.perform(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers[0].fullstitches.len(), 1);
    assert_eq!(patproj.pattern.layers[0].partstitches.len(), 2);
  }

  // Test revoking the command.
  {
    window.once("stitches:add", move |e| {
      let event = decode_stitches_event(e.payload());
      assert_eq!(event.layer_index, 0);
      assert_eq!(event.stitches.len(), 1);
      assert_eq!(event.stitches[0], stitch);
    });
    window.once("app:pattern-changed", {
      let id = patproj.id.to_string();
      move |e| {
        assert_eq!(serde_json::from_str::<String>(e.payload()).unwrap(), id);
      }
    });

    action.revoke(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.layers[0].fullstitches.len(), 2);
    assert_eq!(patproj.pattern.layers[0].partstitches.len(), 2);
  }
}
