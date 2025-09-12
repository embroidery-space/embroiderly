use embroiderly_pattern::{Grid, PatternProject};
use tauri::test::{MockRuntime, mock_builder};
use tauri::{App, Listener, WebviewUrl, WebviewWindowBuilder, generate_context};

use super::{Action, UpdateGridPropertiesAction};
use crate::utils::base64;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

#[test]
fn test_update_fabric() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();
  let grid = Grid {
    major_lines_interval: 15,
    ..Grid::default()
  };
  let action = UpdateGridPropertiesAction::new(grid.clone());

  // Test executing the command.
  {
    window.once("grid:update", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: Grid = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected, grid);
    });

    action.perform(&window, &mut patproj).unwrap();
  }

  // Test revoking the command.
  {
    window.once("grid:update", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: Grid = borsh::from_slice(&base64::decode(base64).unwrap()).unwrap();
      assert_eq!(expected, Grid::default());
    });

    action.revoke(&window, &mut patproj).unwrap();
  }
}
