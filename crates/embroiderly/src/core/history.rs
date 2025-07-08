//! This module contains the definition of a history of actions.
//! The history is stored per pattern project.

use super::actions::Action;

#[cfg(test)]
#[path = "history.test.rs"]
mod tests;

/// A history of actions.
pub struct History<R: tauri::Runtime> {
  undo_stack: Vec<HistoryEntry<R>>,
  redo_stack: Vec<HistoryEntry<R>>,
  active_transaction: Option<Vec<Box<dyn Action<R>>>>,
  last_transaction_id: usize,
}

/// An entry in the history can be either a single action or a transaction.
enum HistoryEntry<R: tauri::Runtime> {
  Single(Box<dyn Action<R>>),
  Transaction(Transaction<R>),
}

struct Transaction<R: tauri::Runtime> {
  id: usize,
  actions: Vec<Box<dyn Action<R>>>,
}

impl<R: tauri::Runtime> History<R> {
  /// Creates a new transaction.
  /// After calling this method, all actions pushed to the history will be part of this transaction until `end_transaction` is called.
  pub fn start_transaction(&mut self) {
    if self.active_transaction.is_none() {
      self.active_transaction = Some(Vec::new());
      self.redo_stack.clear();
    }
  }

  /// Ends the current transaction and pushes it to the undo stack.
  pub fn end_transaction(&mut self) {
    if let Some(actions) = self.active_transaction.take() {
      if !actions.is_empty() {
        self.undo_stack.push(HistoryEntry::Transaction(Transaction {
          id: self.last_transaction_id,
          actions,
        }));
        self.redo_stack.clear();
        self.last_transaction_id += 1;
      }
    }
  }

  /// Add an action object to the history.
  /// If there is an active transaction, the action will be added to that transaction.
  /// Otherwise, it will be added as a single action to the undo stack.
  pub fn push(&mut self, action: Box<dyn Action<R>>) {
    if self.undo_stack.last().is_some_and(|entry| match entry {
      HistoryEntry::Single(action) => self.is_checkpoint_action(action.clone()),
      HistoryEntry::Transaction(_) => false,
    }) && self.is_checkpoint_action(action.clone())
    {
      // Do not push a new `CheckpointAction` if the last action is already a `CheckpointAction`.
      return;
    }

    if let Some(active_transaction) = &mut self.active_transaction {
      active_transaction.push(action);
    } else {
      self.undo_stack.push(HistoryEntry::Single(action));
    }

    self.redo_stack.clear();
  }

  /// Get the last action object from the undo stack.
  /// This pops the action object from the undo stack and pushes it to the redo stack, then returns it.
  /// If the next item in the undo stack is a `CheckpointAction`, it will also be moved to the redo stack.
  pub fn undo(&mut self) -> Option<Box<dyn Action<R>>> {
    if self.undo_stack.len() == 1
      && self.undo_stack.last().is_some_and(|action| match action {
        HistoryEntry::Single(action) => self.is_checkpoint_action(action.clone()),
        HistoryEntry::Transaction(_) => false,
      })
    {
      // If the only action in the undo stack is a `CheckpointAction`, skip undoing it.
      return None;
    }

    if self.active_transaction.is_some() {
      // If there is an active transaction, we end the transaction before proceeding.
      self.end_transaction();
    }

    if let Some(entry) = self.undo_stack.last_mut() {
      match entry {
        HistoryEntry::Single(_) => {
          // Currently, in this branch, we have a pointer to a `Single` action.
          // Pop the last action from the undo stack to get the owned action instance.
          let HistoryEntry::Single(action) = self.undo_stack.pop().unwrap() else {
            unreachable!()
          };

          if self.is_checkpoint_action(action.clone()) {
            // Push the `CheckpointAction` to the redo stack, but do not return it.
            self.redo_stack.push(HistoryEntry::Single(action));

            // Undo the next action in the undo stack.
            if let Some(HistoryEntry::Single(action)) = self.undo_stack.pop() {
              self.redo_stack.push(HistoryEntry::Single(action.clone()));
              return Some(action);
            }
          } else {
            self.redo_stack.push(HistoryEntry::Single(action.clone()));
            return Some(action);
          }
        }
        HistoryEntry::Transaction(transaction) => {
          if let Some(action) = transaction.actions.pop() {
            match self.redo_stack.last_mut() {
              Some(HistoryEntry::Transaction(last_transaction)) if last_transaction.id == transaction.id => {
                // If the last action in the redo stack is part of the same transaction, we can push the action to it.
                last_transaction.actions.push(action.clone());
              }
              _ => {
                // Otherwise, we create a new transaction entry with the same id in the redo stack.
                self.redo_stack.push(HistoryEntry::Transaction(Transaction {
                  id: transaction.id,
                  actions: vec![action.clone()],
                }));
              }
            }

            if transaction.actions.is_empty() {
              // If the transaction is now empty, pop it from the undo stack.
              self.undo_stack.pop();
            }

            return Some(action);
          } else {
            unreachable!("The undo stack should not contain empty transactions.");
          }
        }
      };
    }

    None
  }

  /// Get the last action object from the redo stack.
  /// This pops the action object from the redo stack and pushes it to the undo stack, then returns it.
  /// If the next item in the redo stack is a `CheckpointAction`, it will also be moved to the undo stack.
  pub fn redo(&mut self) -> Option<Box<dyn Action<R>>> {
    if let Some(entry) = self.redo_stack.last_mut() {
      match entry {
        HistoryEntry::Single(_) => {
          // Currently, in this branch, we have a pointer to a `Single` action.
          // Pop the last action from the undo stack to get the owned action instance.
          let HistoryEntry::Single(action) = self.redo_stack.pop().unwrap() else {
            unreachable!()
          };

          // The `CheckpointAction` is always preceded by any other entry.
          // So this action should not be a `CheckpointAction`.
          debug_assert!(!self.is_checkpoint_action(action.clone()));

          self.undo_stack.push(HistoryEntry::Single(action.clone()));

          if self.redo_stack.last().is_some_and(|entry| match entry {
            HistoryEntry::Single(action) => self.is_checkpoint_action(action.clone()),
            HistoryEntry::Transaction(_) => false,
          }) {
            // If the next action in the redo stack is a `CheckpointAction`, we need to pop it from the redo stack.
            self.undo_stack.push(self.redo_stack.pop().unwrap());
          }

          return Some(action);
        }
        HistoryEntry::Transaction(transaction) => {
          if let Some(action) = transaction.actions.pop() {
            match self.undo_stack.last_mut() {
              Some(HistoryEntry::Transaction(last_transaction)) if last_transaction.id == transaction.id => {
                // If the last action in the undo stack is part of the same transaction, we can push the action to it.
                last_transaction.actions.push(action.clone());
              }
              _ => {
                // Otherwise, we create a new transaction entry with the same id in the undo stack.
                self.undo_stack.push(HistoryEntry::Transaction(Transaction {
                  id: transaction.id,
                  actions: vec![action.clone()],
                }));
              }
            }

            if transaction.actions.is_empty() {
              // If the transaction is now empty, pop it from the redo stack.
              self.redo_stack.pop();
            }

            return Some(action);
          } else {
            unreachable!("The redo stack should not contain empty transactions.");
          }
        }
      }
    }
    None
  }

  /// Get last action objects from the undo stack.
  /// If the last action is a `Transaction`, it returns all actions in that transaction.
  /// If the last action is a `Single` action, it returns that action.
  pub fn undo_transaction(&mut self) -> Option<Vec<Box<dyn Action<R>>>> {
    if let Some(entry) = self.undo_stack.last() {
      match entry {
        HistoryEntry::Single(_) => return Some(vec![self.undo().unwrap()]),
        HistoryEntry::Transaction(_) => {
          // Currently, in this branch, we have a pointer to a `Transaction` action.
          // Pop the last action from the undo stack to get the owned action instance.
          let HistoryEntry::Transaction(transaction) = self.undo_stack.pop().unwrap() else {
            unreachable!()
          };

          match self.redo_stack.last_mut() {
            Some(HistoryEntry::Transaction(last_transaction)) if last_transaction.id == transaction.id => {
              // If the last action in the redo stack is part of the same transaction, we can push the actions to it in reverse order.
              last_transaction
                .actions
                .extend(transaction.actions.iter().rev().cloned());
            }
            _ => {
              // Otherwise, we create a new transaction entry with the same id with reversed actions in the redo stack.
              self.redo_stack.push(HistoryEntry::Transaction(Transaction {
                id: transaction.id,
                actions: transaction.actions.iter().rev().cloned().collect(),
              }));
            }
          }

          return Some(transaction.actions);
        }
      }
    }
    None
  }

  /// Get last action objects from the redo stack.
  /// If the last action is a `Transaction`, it returns all actions in that transaction.
  /// If the last action is a `Single` action, it returns that action.
  pub fn redo_transaction(&mut self) -> Option<Vec<Box<dyn Action<R>>>> {
    if let Some(entry) = self.redo_stack.last() {
      match entry {
        HistoryEntry::Single(_) => return Some(vec![self.redo().unwrap()]),
        HistoryEntry::Transaction(_) => {
          // Currently, in this branch, we have a pointer to a `Transaction` action.
          // Pop the last action from the redo stack to get the owned action instance.
          let HistoryEntry::Transaction(transaction) = self.redo_stack.pop().unwrap() else {
            unreachable!()
          };

          match self.undo_stack.last_mut() {
            Some(HistoryEntry::Transaction(last_transaction)) if last_transaction.id == transaction.id => {
              // If the last action in the undo stack is part of the same transaction, we can push the actions to it in reverse order.
              last_transaction
                .actions
                .extend(transaction.actions.iter().rev().cloned());
            }
            _ => {
              // Otherwise, we create a new transaction entry with the same id with reversed actions in the undo stack.
              self.undo_stack.push(HistoryEntry::Transaction(Transaction {
                id: transaction.id,
                actions: transaction.actions.iter().rev().cloned().collect(),
              }));
            }
          }

          return Some(transaction.actions);
        }
      }
    }
    None
  }

  /// Identifies if there are any unsaved changes in the history.
  pub fn has_unsaved_changes(&self) -> bool {
    !self.undo_stack.last().is_none_or(|entry| match entry {
      HistoryEntry::Single(action) => self.is_checkpoint_action(action.clone()),
      HistoryEntry::Transaction(_) => false,
    })
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
      active_transaction: None,
      last_transaction_id: 0,
    }
  }
}
