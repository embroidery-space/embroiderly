use tauri::test::MockRuntime;

use super::History;
use crate::core::actions::CheckpointAction;
use crate::core::actions::mock::MockAction;

mod single {
  use super::*;

  #[test]
  fn test_push() {
    let mut history = History::<MockRuntime>::default();

    history.push(Box::new(MockAction));
    assert_eq!(history.undo_stack.len(), 1);
    assert_eq!(history.redo_stack.len(), 0);

    history.push(Box::new(MockAction));
    assert_eq!(history.undo_stack.len(), 2);
    assert_eq!(history.redo_stack.len(), 0);
  }

  #[test]
  fn test_undo() {
    let mut history = History::<MockRuntime>::default();

    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));
    assert_eq!(history.undo_stack.len(), 2);
    assert_eq!(history.redo_stack.len(), 0);

    assert!(history.undo().is_some());
    assert_eq!(history.undo_stack.len(), 1);
    assert_eq!(history.redo_stack.len(), 1);

    assert!(history.undo().is_some());
    assert_eq!(history.undo_stack.len(), 0);
    assert_eq!(history.redo_stack.len(), 2);
    assert!(history.undo().is_none());
  }

  #[test]
  fn test_redo() {
    let mut history = History::<MockRuntime>::default();
    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));
    history.undo();

    assert!(history.redo().is_some());
    assert_eq!(history.undo_stack.len(), 2);
    assert_eq!(history.redo_stack.len(), 0);
    assert!(history.redo().is_none());
  }

  #[test]
  fn test_push_checkpoint() {
    let mut history = History::<MockRuntime>::default();

    history.push(Box::new(MockAction));
    history.push(Box::new(CheckpointAction));
    assert_eq!(history.undo_stack.len(), 2);

    // Pushing another `CheckpointAction` after a checkpoint does not save it.
    history.push(Box::new(CheckpointAction));
    assert_eq!(history.undo_stack.len(), 2);

    // Pushing an action after a checkpoint creates saves it.
    history.push(Box::new(MockAction));
    assert_eq!(history.undo_stack.len(), 3);
  }

  #[test]
  fn test_undo_checkpoint() {
    let mut history = History::<MockRuntime>::default();

    history.push(Box::new(CheckpointAction));
    history.push(Box::new(MockAction));
    history.push(Box::new(CheckpointAction));
    history.push(Box::new(MockAction));

    // Undoing am action moves it to the redo stack.
    assert!(history.undo().is_some());
    assert_eq!(history.undo_stack.len(), 3);
    assert_eq!(history.redo_stack.len(), 1);

    // Undoing an action followed by a checkpoint moves the checkpoint to the redo stack.
    assert!(history.undo().is_some());
    assert_eq!(history.undo_stack.len(), 1);
    assert_eq!(history.redo_stack.len(), 3);

    // Undoing a checkpoint does not move it to the redo stack.
    assert!(history.undo().is_none());
  }

  #[test]
  fn test_redo_checkpoint() {
    let mut history = History::<MockRuntime>::default();

    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));
    history.push(Box::new(CheckpointAction));

    history.undo();
    history.undo();
    assert_eq!(history.undo_stack.len(), 1);
    assert_eq!(history.redo_stack.len(), 3);

    // Redoing an action moves it to the undo stack.
    assert!(history.redo().is_some());
    assert_eq!(history.undo_stack.len(), 2);
    assert_eq!(history.redo_stack.len(), 2);

    // Redoing an action followed by a checkpoint moves the checkpoint to the undo stack.
    assert!(history.redo().is_some());
    assert_eq!(history.undo_stack.len(), 4);
    assert_eq!(history.redo_stack.len(), 0);
  }

  #[test]
  fn test_has_unsaved_changes() {
    let mut history = History::<MockRuntime>::default();

    // Initially, there are no unsaved changes.
    assert!(!history.has_unsaved_changes());

    // After pushing a checkpoint, there are no unsaved changes.
    history.push(Box::new(CheckpointAction));
    assert!(!history.has_unsaved_changes());

    // After pushing an action, there are unsaved changes.
    history.push(Box::new(MockAction));
    assert!(history.has_unsaved_changes());

    // After undoing the action, there are no unsaved changes since the last action was a checkpoint.
    history.undo();
    assert!(!history.has_unsaved_changes());
  }
}
