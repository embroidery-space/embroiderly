use tauri::test::MockRuntime;

use super::{History, HistoryEntry};
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

mod transactions {
  use super::*;

  #[test]
  fn test_creating_transaction() {
    let mut history = History::<MockRuntime>::default();

    history.start_transaction();
    assert!(history.active_transaction.is_some());

    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));

    history.end_transaction();
    assert!(history.active_transaction.is_none());

    assert_eq!(history.undo_stack.len(), 1);
    assert_eq!(history.redo_stack.len(), 0);

    if let Some(HistoryEntry::Transaction(transaction)) = history.undo_stack.first() {
      assert_eq!(transaction.actions.len(), 2);
    } else {
      panic!("Expected a transaction in the undo stack.");
    }
  }

  #[test]
  fn test_undo() {
    let mut history = History::<MockRuntime>::default();

    history.start_transaction();
    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));
    history.end_transaction();

    assert!(history.undo().is_some());

    assert_eq!(history.undo_stack.len(), 1);
    assert_eq!(history.redo_stack.len(), 1);

    let undo_transaction_id;
    if let Some(HistoryEntry::Transaction(transaction)) = history.undo_stack.first() {
      assert_eq!(transaction.actions.len(), 1);
      undo_transaction_id = transaction.id;
    } else {
      panic!("Expected a transaction in the undo stack.");
    }

    let redo_transaction_id;
    if let Some(HistoryEntry::Transaction(transaction)) = history.redo_stack.first() {
      assert_eq!(transaction.actions.len(), 1);
      redo_transaction_id = transaction.id;
    } else {
      panic!("Expected a transaction in the redo stack.");
    }

    assert_eq!(undo_transaction_id, redo_transaction_id);
  }

  #[test]
  fn test_undo_single_action() {
    let mut history = History::<MockRuntime>::default();

    history.start_transaction();
    history.push(Box::new(MockAction));
    history.end_transaction();

    assert!(history.undo().is_some());

    assert_eq!(history.undo_stack.len(), 0);
    assert_eq!(history.redo_stack.len(), 1);

    if let Some(HistoryEntry::Transaction(transaction)) = history.redo_stack.first() {
      assert_eq!(transaction.actions.len(), 1);
    } else {
      panic!("Expected a transaction in the redo stack.");
    }
  }

  #[test]
  fn test_redo() {
    let mut history = History::<MockRuntime>::default();

    history.start_transaction();
    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));
    history.end_transaction();

    assert!(history.undo().is_some());
    assert!(history.redo().is_some());

    assert_eq!(history.undo_stack.len(), 1);
    assert_eq!(history.redo_stack.len(), 0);

    if let Some(HistoryEntry::Transaction(transaction)) = history.undo_stack.first() {
      assert_eq!(transaction.actions.len(), 2);
    } else {
      panic!("Expected a transaction in the undo stack.");
    }
  }

  #[test]
  fn test_redo_single_action() {
    let mut history = History::<MockRuntime>::default();

    history.start_transaction();
    history.push(Box::new(MockAction));
    history.end_transaction();

    assert!(history.undo().is_some());
    assert!(history.redo().is_some());

    assert_eq!(history.undo_stack.len(), 1);
    assert_eq!(history.redo_stack.len(), 0);

    if let Some(HistoryEntry::Transaction(transaction)) = history.undo_stack.first() {
      assert_eq!(transaction.actions.len(), 1);
    } else {
      panic!("Expected a transaction in the undo stack.");
    }
  }

  #[test]
  fn test_active_transaction_undo() {
    let mut history = History::<MockRuntime>::default();

    history.start_transaction();
    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));
    // The transaction is not ended, so it remains active.

    assert!(history.undo().is_some());

    assert_eq!(history.undo_stack.len(), 1);
    assert_eq!(history.redo_stack.len(), 1);
    assert!(history.active_transaction.is_none());

    if let Some(HistoryEntry::Transaction(transaction)) = history.undo_stack.first() {
      assert_eq!(transaction.actions.len(), 1);
    } else {
      panic!("Expected a transaction in the undo stack.");
    }

    if let Some(HistoryEntry::Transaction(transaction)) = history.redo_stack.first() {
      assert_eq!(transaction.actions.len(), 1);
    } else {
      panic!("Expected a transaction in the redo stack.");
    }
  }

  #[test]
  fn test_active_transaction_redo() {
    let mut history = History::<MockRuntime>::default();

    history.push(Box::new(MockAction));
    assert!(history.undo().is_some());

    assert_eq!(history.undo_stack.len(), 0);
    assert_eq!(history.redo_stack.len(), 1);

    history.start_transaction();
    assert!(history.redo_stack.is_empty());

    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));
    // The transaction is not ended, so it remains active.

    assert!(history.redo().is_none());

    if let Some(actions) = history.active_transaction {
      assert_eq!(actions.len(), 2);
    } else {
      panic!("Expected an active transaction in the history.");
    }
  }

  #[test]
  fn test_undo_transaction() {
    let mut history = History::<MockRuntime>::default();

    history.start_transaction();
    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));
    history.end_transaction();

    let undone_actions = history.undo_transaction();
    assert!(undone_actions.is_some_and(|actions| actions.len() == 2));

    assert_eq!(history.undo_stack.len(), 0);
    assert_eq!(history.redo_stack.len(), 1);

    if let Some(HistoryEntry::Transaction(transaction)) = history.redo_stack.first() {
      assert_eq!(transaction.actions.len(), 2);
    } else {
      panic!("Expected a transaction in the redo stack.");
    }
  }

  #[test]
  fn test_redo_transaction() {
    let mut history = History::<MockRuntime>::default();

    history.start_transaction();
    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));
    history.end_transaction();

    history.undo_transaction();
    let redone_actions = history.redo_transaction();
    assert!(redone_actions.is_some_and(|actions| actions.len() == 2));

    assert_eq!(history.undo_stack.len(), 1);
    assert_eq!(history.redo_stack.len(), 0);

    if let Some(HistoryEntry::Transaction(transaction)) = history.undo_stack.first() {
      assert_eq!(transaction.actions.len(), 2);
    } else {
      panic!("Expected a transaction in the undo stack.");
    }
  }

  #[test]
  fn test_undo_transaction_single_action() {
    let mut history = History::<MockRuntime>::default();

    history.push(Box::new(MockAction));

    let undone_actions = history.undo_transaction();
    assert!(undone_actions.is_some_and(|actions| actions.len() == 1));

    assert_eq!(history.undo_stack.len(), 0);
    assert_eq!(history.redo_stack.len(), 1);

    assert!(matches!(history.redo_stack.first(), Some(HistoryEntry::Single(_))));
  }

  #[test]
  fn test_redo_transaction_single_action() {
    let mut history = History::<MockRuntime>::default();

    history.push(Box::new(MockAction));
    history.push(Box::new(MockAction));

    history.undo_transaction();
    let redone_actions = history.redo_transaction();
    assert!(redone_actions.is_some_and(|actions| actions.len() == 1));

    assert_eq!(history.undo_stack.len(), 2);
    assert_eq!(history.redo_stack.len(), 0);

    assert!(matches!(history.undo_stack.last(), Some(HistoryEntry::Single(_))));
  }
}
