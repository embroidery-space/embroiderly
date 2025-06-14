//! This module contains the definition of a history of actions.
//! The history is stored per pattern project.

use super::actions::Action;

#[cfg(test)]
#[path = "history.test.rs"]
mod tests;

/// A history of actions.
pub struct History<R: tauri::Runtime> {
  undo_stack: Vec<Box<dyn Action<R>>>,
  redo_stack: Vec<Box<dyn Action<R>>>,
}

impl<R: tauri::Runtime> History<R> {
  /// Add an action object to the history.
  /// This pushes the action object to the undo stack and clears the redo stack.
  pub fn push(&mut self, action: Box<dyn Action<R>>) {
    if self
      .undo_stack
      .last()
      .is_some_and(|action| self.is_checkpoint_action(action.clone()))
      && self.is_checkpoint_action(action.clone())
    {
      // Do not push a new `CheckpointAction` if the last action is already a `CheckpointAction`.
      return;
    }
    self.undo_stack.push(action);
    self.redo_stack.clear();
  }

  /// Get the last action object from the undo stack.
  /// This pops the action object from the undo stack and pushes it to the redo stack, then returns it.
  /// If the next item in the undo stack is a `CheckpointAction`, it will also be moved to the redo stack.
  pub fn undo(&mut self) -> Option<Box<dyn Action<R>>> {
    if self.undo_stack.len() == 1 && self.is_checkpoint_action(self.undo_stack[0].clone()) {
      // If the only action in the undo stack is a `CheckpointAction`, skip undoing it.
      return None;
    }
    if let Some(action) = self.undo_stack.pop() {
      if self.is_checkpoint_action(action.clone()) {
        self.redo_stack.push(action);
        return self.undo_stack.pop().inspect(|action| {
          self.redo_stack.push(action.clone());
        });
      } else {
        self.redo_stack.push(action.clone());
        return Some(action);
      }
    }
    None
  }

  /// Get the last action object from the redo stack.
  /// This pops the action object from the redo stack and pushes it to the undo stack, then returns it.
  /// If the next item in the redo stack is a `CheckpointAction`, it will also be moved to the undo stack.
  pub fn redo(&mut self) -> Option<Box<dyn Action<R>>> {
    if let Some(action) = self.redo_stack.pop() {
      // Ensure that the `CheckpointAction` is not pushed to the undo stack as a single action.
      debug_assert!(!self.is_checkpoint_action(action.clone()));
      self.undo_stack.push(action.clone());

      if self
        .redo_stack
        .last()
        .is_some_and(|action| self.is_checkpoint_action(action.clone()))
      {
        self.undo_stack.push(self.redo_stack.pop().unwrap());
      }

      return Some(action);
    }
    None
  }

  /// Identifies if there are any unsaved changes in the history.
  pub fn has_unsaved_changes(&self) -> bool {
    !self
      .undo_stack
      .last()
      .is_none_or(|action| self.is_checkpoint_action(action.clone()))
  }

  /// Helper method to check if an action is a `CheckpointAction`.
  fn is_checkpoint_action(&self, action: Box<dyn std::any::Any>) -> bool {
    action.downcast_ref::<super::actions::CheckpointAction>().is_some()
  }
}

impl<R: tauri::Runtime> Default for History<R> {
  fn default() -> Self {
    Self {
      undo_stack: Vec::new(),
      redo_stack: Vec::new(),
    }
  }
}
