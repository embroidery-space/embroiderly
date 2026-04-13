use embroiderly_pattern::{PatternInfo, PatternProject};

use super::{History, HistoryEntry};
use crate::actions::{EditorAction, PatternAction};

fn perform_and_push(history: &mut History, mut action: EditorAction, patproj: &mut PatternProject) {
  action.perform(patproj).unwrap();
  history.push(action);
}

fn info_action(title: &str) -> EditorAction {
  EditorAction::Pattern(PatternAction::UpdateInfo {
    info: PatternInfo {
      title: title.to_string(),
      ..PatternInfo::default()
    },
    old_info: None,
  })
}

mod single {
  use super::*;

  #[test]
  fn test_push() {
    let mut history = History::default();

    history.push(EditorAction::Mock);
    assert_eq!(history.undo_stack_len(), 1);
    assert_eq!(history.redo_stack_len(), 0);

    history.push(EditorAction::Mock);
    assert_eq!(history.undo_stack_len(), 2);
    assert_eq!(history.redo_stack_len(), 0);
  }

  #[test]
  fn test_undo() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);
    assert_eq!(history.undo_stack_len(), 2);
    assert_eq!(history.redo_stack_len(), 0);

    assert!(history.undo(&mut patproj).unwrap().is_some());
    assert_eq!(history.undo_stack_len(), 1);
    assert_eq!(history.redo_stack_len(), 1);

    assert!(history.undo(&mut patproj).unwrap().is_some());
    assert_eq!(history.undo_stack_len(), 0);
    assert_eq!(history.redo_stack_len(), 2);
    assert!(history.undo(&mut patproj).unwrap().is_none());
  }

  #[test]
  fn test_redo() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);
    history.undo(&mut patproj).unwrap();

    assert!(history.redo(&mut patproj).unwrap().is_some());
    assert_eq!(history.undo_stack_len(), 2);
    assert_eq!(history.redo_stack_len(), 0);
    assert!(history.redo(&mut patproj).unwrap().is_none());
  }

  #[test]
  fn test_push_checkpoint() {
    let mut history = History::default();

    history.push(EditorAction::Mock);
    history.push_checkpoint();
    assert_eq!(history.undo_stack_len(), 2);

    // Pushing another checkpoint after a checkpoint does not save it.
    history.push_checkpoint();
    assert_eq!(history.undo_stack_len(), 2);

    // Pushing an action after a checkpoint saves it.
    history.push(EditorAction::Mock);
    assert_eq!(history.undo_stack_len(), 3);
  }

  #[test]
  fn test_undo_checkpoint() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.push_checkpoint();
    history.push(EditorAction::Mock);
    history.push_checkpoint();
    history.push(EditorAction::Mock);

    // Undoing an action moves it to the redo stack.
    assert!(history.undo(&mut patproj).unwrap().is_some());
    assert_eq!(history.undo_stack_len(), 3);
    assert_eq!(history.redo_stack_len(), 1);

    // Undoing an action followed by a checkpoint moves the checkpoint to the redo stack.
    assert!(history.undo(&mut patproj).unwrap().is_some());
    assert_eq!(history.undo_stack_len(), 1);
    assert_eq!(history.redo_stack_len(), 3);

    // Undoing a checkpoint does not move it to the redo stack.
    assert!(history.undo(&mut patproj).unwrap().is_none());
  }

  #[test]
  fn test_redo_checkpoint() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);
    history.push_checkpoint();

    history.undo(&mut patproj).unwrap();
    history.undo(&mut patproj).unwrap();
    assert_eq!(history.undo_stack_len(), 1);
    assert_eq!(history.redo_stack_len(), 3);

    // Redoing an action moves it to the undo stack.
    assert!(history.redo(&mut patproj).unwrap().is_some());
    assert_eq!(history.undo_stack_len(), 2);
    assert_eq!(history.redo_stack_len(), 2);

    // Redoing an action followed by a checkpoint moves the checkpoint to the undo stack.
    assert!(history.redo(&mut patproj).unwrap().is_some());
    assert_eq!(history.undo_stack_len(), 4);
    assert_eq!(history.redo_stack_len(), 0);
  }

  #[test]
  fn test_has_unsaved_changes() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    // Initially, there are no unsaved changes.
    assert!(!history.has_unsaved_changes());

    // After pushing a checkpoint, there are no unsaved changes.
    history.push_checkpoint();
    assert!(!history.has_unsaved_changes());

    // After pushing an action, there are unsaved changes.
    history.push(EditorAction::Mock);
    assert!(history.has_unsaved_changes());

    // After undoing the action, there are no unsaved changes since the last action was a checkpoint.
    history.undo(&mut patproj).unwrap();
    assert!(!history.has_unsaved_changes());
  }
}

mod transactions {
  use super::*;

  #[test]
  fn test_creating_transaction() {
    let mut history = History::default();

    history.start_transaction();
    assert!(history.active_transaction.is_some());

    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);

    history.end_transaction();
    assert!(history.active_transaction.is_none());

    assert_eq!(history.undo_stack_len(), 1);
    assert_eq!(history.redo_stack_len(), 0);

    if let Some(HistoryEntry::Transaction(transaction)) = history.undo_stack.first() {
      assert_eq!(transaction.actions.len(), 2);
    } else {
      panic!("Expected a transaction in the undo stack.");
    }
  }

  #[test]
  fn test_undo() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.start_transaction();
    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);
    history.end_transaction();

    assert!(history.undo(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 1);
    assert_eq!(history.redo_stack_len(), 1);

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
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.start_transaction();
    history.push(EditorAction::Mock);
    history.end_transaction();

    assert!(history.undo(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 0);
    assert_eq!(history.redo_stack_len(), 1);

    if let Some(HistoryEntry::Transaction(transaction)) = history.redo_stack.first() {
      assert_eq!(transaction.actions.len(), 1);
    } else {
      panic!("Expected a transaction in the redo stack.");
    }
  }

  #[test]
  fn test_redo() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.start_transaction();
    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);
    history.end_transaction();

    assert!(history.undo(&mut patproj).unwrap().is_some());
    assert!(history.redo(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 1);
    assert_eq!(history.redo_stack_len(), 0);

    if let Some(HistoryEntry::Transaction(transaction)) = history.undo_stack.first() {
      assert_eq!(transaction.actions.len(), 2);
    } else {
      panic!("Expected a transaction in the undo stack.");
    }
  }

  #[test]
  fn test_redo_single_action() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.start_transaction();
    history.push(EditorAction::Mock);
    history.end_transaction();

    assert!(history.undo(&mut patproj).unwrap().is_some());
    assert!(history.redo(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 1);
    assert_eq!(history.redo_stack_len(), 0);

    if let Some(HistoryEntry::Transaction(transaction)) = history.undo_stack.first() {
      assert_eq!(transaction.actions.len(), 1);
    } else {
      panic!("Expected a transaction in the undo stack.");
    }
  }

  #[test]
  fn test_active_transaction_undo() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.start_transaction();
    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);
    // The transaction is not ended, so it remains active.

    assert!(history.undo(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 1);
    assert_eq!(history.redo_stack_len(), 1);
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
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.push(EditorAction::Mock);
    assert!(history.undo(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 0);
    assert_eq!(history.redo_stack_len(), 1);

    history.start_transaction();
    assert!(history.redo_stack_is_empty());

    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);
    // The transaction is not ended, so it remains active.

    assert!(history.redo(&mut patproj).unwrap().is_none());

    if let Some(actions) = &history.active_transaction {
      assert_eq!(actions.len(), 2);
    } else {
      panic!("Expected an active transaction in the history.");
    }
  }

  #[test]
  fn test_undo_transaction() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.start_transaction();
    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);
    history.end_transaction();

    assert!(history.undo_transaction(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 0);
    assert_eq!(history.redo_stack_len(), 1);

    if let Some(HistoryEntry::Transaction(transaction)) = history.redo_stack.first() {
      assert_eq!(transaction.actions.len(), 2);
    } else {
      panic!("Expected a transaction in the redo stack.");
    }
  }

  #[test]
  fn test_redo_transaction() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.start_transaction();
    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);
    history.end_transaction();

    history.undo_transaction(&mut patproj).unwrap();
    assert!(history.redo_transaction(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 1);
    assert_eq!(history.redo_stack_len(), 0);

    if let Some(HistoryEntry::Transaction(transaction)) = history.undo_stack.first() {
      assert_eq!(transaction.actions.len(), 2);
    } else {
      panic!("Expected a transaction in the undo stack.");
    }
  }

  #[test]
  fn test_undo_redo_transaction_ordering() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    // Simulate: add stitches in a transaction, then save (checkpoint).
    history.start_transaction();
    perform_and_push(&mut history, info_action("A"), &mut patproj);
    perform_and_push(&mut history, info_action("B"), &mut patproj);
    history.end_transaction();

    assert_eq!(patproj.pattern.info.title, "B");

    history.undo_transaction(&mut patproj).unwrap();
    assert_eq!(patproj.pattern.info.title, "Untitled");

    history.redo_transaction(&mut patproj).unwrap();
    assert_eq!(patproj.pattern.info.title, "B");
  }

  #[test]
  fn test_undo_redo_transaction_matches_stepwise() {
    let build_history = |history: &mut History, patproj: &mut PatternProject| {
      history.start_transaction();
      perform_and_push(history, info_action("A"), patproj);
      perform_and_push(history, info_action("B"), patproj);
      history.end_transaction();
    };

    let mut h_atomic = History::default();
    let mut p_atomic = PatternProject::default();
    build_history(&mut h_atomic, &mut p_atomic);

    let mut h_stepwise = History::default();
    let mut p_stepwise = PatternProject::default();
    build_history(&mut h_stepwise, &mut p_stepwise);

    h_atomic.undo_transaction(&mut p_atomic).unwrap();
    h_stepwise.undo(&mut p_stepwise).unwrap();
    h_stepwise.undo(&mut p_stepwise).unwrap();
    assert_eq!(p_atomic.pattern.info.title, p_stepwise.pattern.info.title);

    h_atomic.redo_transaction(&mut p_atomic).unwrap();
    h_stepwise.redo(&mut p_stepwise).unwrap();
    h_stepwise.redo(&mut p_stepwise).unwrap();
    assert_eq!(p_atomic.pattern.info.title, p_stepwise.pattern.info.title);
    assert_eq!(p_atomic.pattern.info.title, "B");
  }

  #[test]
  fn test_undo_transaction_after_checkpoint() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    // Simulate: add stitches in a transaction, then save (checkpoint).
    history.start_transaction();
    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);
    history.end_transaction();
    history.push_checkpoint();

    assert_eq!(history.undo_stack_len(), 2);

    // Undoing should skip the checkpoint and undo the transaction.
    assert!(history.undo_transaction(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 0);
    assert_eq!(history.redo_stack_len(), 2);
  }

  #[test]
  fn test_undo_transaction_single_action() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.push(EditorAction::Mock);

    assert!(history.undo_transaction(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 0);
    assert_eq!(history.redo_stack_len(), 1);

    assert!(matches!(history.redo_stack.first(), Some(HistoryEntry::Single(_))));
  }

  #[test]
  fn test_undo_transaction_single_action_after_checkpoint() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    // Simulate: add a single stitch action, then save (checkpoint).
    history.push(EditorAction::Mock);
    history.push_checkpoint();

    assert_eq!(history.undo_stack_len(), 2);

    // Undoing should skip the checkpoint and undo the single action.
    assert!(history.undo_transaction(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 0);
    assert_eq!(history.redo_stack_len(), 2);
  }

  #[test]
  fn test_redo_transaction_single_action() {
    let mut history = History::default();
    let mut patproj = PatternProject::default();

    history.push(EditorAction::Mock);
    history.push(EditorAction::Mock);

    history.undo_transaction(&mut patproj).unwrap();
    assert!(history.redo_transaction(&mut patproj).unwrap().is_some());

    assert_eq!(history.undo_stack_len(), 2);
    assert_eq!(history.redo_stack_len(), 0);

    assert!(matches!(history.undo_stack.last(), Some(HistoryEntry::Single(_))));
  }
}
