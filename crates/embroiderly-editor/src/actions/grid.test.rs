use embroiderly_pattern::{EmbroiderlyProject, Grid};

use crate::actions::GridAction;
use crate::{EditorAction, EditorEvent};

#[test]
fn test_update_grid() {
  let mut embproj = EmbroiderlyProject::default();
  let grid = Grid {
    major_lines_interval: 15,
    ..Grid::default()
  };
  let mut action = EditorAction::Grid(GridAction::Update {
    grid: grid.clone(),
    old_grid: None,
  });

  // Test executing the command.
  {
    let events = action.perform(&mut embproj).unwrap();
    let EditorEvent::GridUpdate(g) = &events[0] else {
      panic!("expected GridUpdate");
    };
    assert_eq!(g, &grid);

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }

  // Test revoking the command.
  {
    let events = action.revoke(&mut embproj).unwrap();
    let EditorEvent::GridUpdate(g) = &events[0] else {
      panic!("expected GridUpdate");
    };
    assert_eq!(g, &Grid::default());

    assert!(matches!(events.last(), Some(EditorEvent::PatternChanged(id)) if *id == embproj.id));
  }
}
