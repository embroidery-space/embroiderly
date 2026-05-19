use embroiderly_pattern::EmbroiderlyProject;

use super::*;
use crate::actions::EditorAction;
use crate::error::Error;

#[test]
fn test_editor_new() {
  let editor = Editor::new();
  assert!(editor.projects.is_empty());
  assert!(editor.histories.is_empty());
}

#[test]
fn test_add_and_remove_pattern() {
  let mut editor = Editor::new();
  let embproj = EmbroiderlyProject::default();
  let id = embproj.id;

  let returned_id = editor.add_pattern(embproj.clone());
  assert_eq!(id, returned_id);

  assert!(editor.get_pattern(&id).is_some());
  assert!(editor.get_pattern_mut(&id).is_some());

  let removed = editor.remove_pattern(&id);
  assert!(removed.is_some());
  assert_eq!(removed.unwrap().id, id);

  assert!(editor.get_pattern(&id).is_none());
  assert!(editor.get_pattern_mut(&id).is_none());
}

#[test]
fn test_pattern_not_found() {
  let mut editor = Editor::new();
  let id = uuid::Uuid::new_v4();

  assert!(matches!(
    editor.dispatch(&id, EditorAction::Mock),
    Err(Error::PatternNotFound(_))
  ));
  assert!(matches!(editor.undo(&id), Err(Error::PatternNotFound(_))));
  assert!(matches!(editor.redo(&id), Err(Error::PatternNotFound(_))));
  assert!(matches!(editor.undo_transaction(&id), Err(Error::PatternNotFound(_))));
  assert!(matches!(editor.redo_transaction(&id), Err(Error::PatternNotFound(_))));
  assert!(matches!(editor.start_transaction(&id), Err(Error::PatternNotFound(_))));
  assert!(matches!(editor.end_transaction(&id), Err(Error::PatternNotFound(_))));
  assert!(matches!(editor.checkpoint(&id), Err(Error::PatternNotFound(_))));
  assert!(matches!(
    editor.has_unsaved_changes(&id),
    Err(Error::PatternNotFound(_))
  ));
}

#[test]
fn test_dispatch_undo_redo() {
  let mut editor = Editor::new();
  let embproj = EmbroiderlyProject::default();
  let id = editor.add_pattern(embproj);

  assert!(!editor.has_unsaved_changes(&id).unwrap());

  let events = editor.dispatch(&id, EditorAction::Mock).unwrap();
  assert!(events.is_empty());
  assert!(editor.has_unsaved_changes(&id).unwrap());

  let events = editor.undo(&id).unwrap();
  assert!(events.is_empty());
  assert!(!editor.has_unsaved_changes(&id).unwrap());

  let events = editor.redo(&id).unwrap();
  assert!(events.is_empty());
  assert!(editor.has_unsaved_changes(&id).unwrap());
}

#[test]
fn test_transactions() {
  let mut editor = Editor::new();
  let embproj = EmbroiderlyProject::default();
  let id = editor.add_pattern(embproj);

  editor.start_transaction(&id).unwrap();
  editor.dispatch(&id, EditorAction::Mock).unwrap();
  editor.dispatch(&id, EditorAction::Mock).unwrap();
  editor.end_transaction(&id).unwrap();

  let events = editor.undo_transaction(&id).unwrap();
  assert!(events.is_empty());

  let events = editor.redo_transaction(&id).unwrap();
  assert!(events.is_empty());
}

#[test]
fn test_checkpoint() {
  let mut editor = Editor::new();
  let embproj = EmbroiderlyProject::default();
  let id = editor.add_pattern(embproj);

  editor.dispatch(&id, EditorAction::Mock).unwrap();
  assert!(editor.has_unsaved_changes(&id).unwrap());

  editor.checkpoint(&id).unwrap();
  assert!(!editor.has_unsaved_changes(&id).unwrap());

  editor.dispatch(&id, EditorAction::Mock).unwrap();
  assert!(editor.has_unsaved_changes(&id).unwrap());
}
