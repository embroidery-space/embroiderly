use embroiderly_pattern::*;
use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindowBuilder, generate_context};

use super::{Action, AddStitchAction, RemoveStitchAction};
use crate::utils::base64;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

fn create_pattern_project() -> PatternProject {
  let mut patproj = PatternProject::default();

  // top-left petite
  patproj.pattern.fullstitches.insert(FullStitch {
    x: Coord::new(0.0).unwrap(),
    y: Coord::new(0.0).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Petite,
  });
  // top-right quarter
  patproj.pattern.partstitches.insert(PartStitch {
    x: Coord::new(0.5).unwrap(),
    y: Coord::new(0.0).unwrap(),
    palindex: 0,
    kind: PartStitchKind::Quarter,
    direction: PartStitchDirection::Forward,
  });
  // bottom-left petite
  patproj.pattern.fullstitches.insert(FullStitch {
    x: Coord::new(0.0).unwrap(),
    y: Coord::new(0.5).unwrap(),
    palindex: 0,
    kind: FullStitchKind::Petite,
  });
  // bottom-right quarter
  patproj.pattern.partstitches.insert(PartStitch {
    x: Coord::new(0.5).unwrap(),
    y: Coord::new(0.5).unwrap(),
    palindex: 0,
    kind: PartStitchKind::Quarter,
    direction: PartStitchDirection::Backward,
  });

  patproj
}

#[test]
fn test_add_stitch() {
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
  let action = AddStitchAction::new(stitch);

  // Test executing the command.
  {
    window.once("stitches:add", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected_stitches: Vec<Stitch> = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected_stitches.len(), 1);
      assert_eq!(expected_stitches[0], stitch);
    });
    window.once("stitches:remove", |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected_stitches: Vec<Stitch> = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      println!("`stitches:remove`: {:?}", expected_stitches);
      assert_eq!(expected_stitches.len(), 4);
    });

    action.perform(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.fullstitches.len(), 1);
    assert_eq!(patproj.pattern.partstitches.len(), 0);
  }

  // Test revoking the command.
  {
    window.once("stitches:remove", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected_stitches: Vec<Stitch> = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected_stitches.len(), 1);
      assert_eq!(expected_stitches[0], stitch);
    });
    window.once("stitches:add", |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected_stitches: Vec<Stitch> = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected_stitches.len(), 4);
    });

    action.revoke(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.fullstitches.len(), 2);
    assert_eq!(patproj.pattern.partstitches.len(), 2);
  }
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
  let action = RemoveStitchAction::new(stitch);

  // Test executing the command.
  {
    window.once("stitches:remove", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected_stitches: Vec<Stitch> = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected_stitches.len(), 1);
      assert_eq!(expected_stitches[0], stitch);
    });

    action.perform(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.fullstitches.len(), 1);
    assert_eq!(patproj.pattern.partstitches.len(), 2);
  }

  // Test revoking the command.
  {
    window.once("stitches:add", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected_stitches: Vec<Stitch> = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected_stitches.len(), 1);
      assert_eq!(expected_stitches[0], stitch);
    });

    action.revoke(&window, &mut patproj).unwrap();
    assert_eq!(patproj.pattern.fullstitches.len(), 2);
    assert_eq!(patproj.pattern.partstitches.len(), 2);
  }
}
