use embroiderly_pattern::PatternProject;

use crate::EditorEvent;
use crate::actions::EditorAction;
use crate::error::Result;

#[cfg(test)]
#[path = "history.test.rs"]
mod tests;

/// An actions history of a specific pattern project.
#[derive(Default)]
pub struct History {
  undo_stack: Vec<HistoryEntry>,
  redo_stack: Vec<HistoryEntry>,
  active_transaction: Option<Vec<EditorAction>>,
  last_transaction_id: usize,
}

enum HistoryEntry {
  Single(EditorAction),
  Transaction(Transaction),
  Checkpoint,
}

struct Transaction {
  id: usize,
  actions: Vec<EditorAction>,
}

impl History {
  #[must_use]
  pub fn new() -> Self {
    Self::default()
  }

  /// Returns the number of items in the undo stack.
  #[must_use]
  pub const fn undo_stack_len(&self) -> usize {
    self.undo_stack.len()
  }

  /// Returns the number of items in the redo stack.
  #[must_use]
  pub const fn redo_stack_len(&self) -> usize {
    self.redo_stack.len()
  }

  /// Returns whether the undo stack is empty.
  #[must_use]
  pub const fn undo_stack_is_empty(&self) -> bool {
    self.undo_stack.is_empty()
  }

  /// Returns whether the redo stack is empty.
  #[must_use]
  pub const fn redo_stack_is_empty(&self) -> bool {
    self.redo_stack.is_empty()
  }

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
    if let Some(actions) = self.active_transaction.take()
      && !actions.is_empty()
    {
      self.undo_stack.push(HistoryEntry::Transaction(Transaction {
        id: self.last_transaction_id,
        actions,
      }));
      self.redo_stack.clear();
      self.last_transaction_id += 1;
    }
  }

  /// Adds an action to the history.
  /// If there is an active transaction, the action will be added to that transaction.
  /// Otherwise, it will be added as a single action to the undo stack.
  pub fn push(&mut self, action: EditorAction) {
    if let Some(active_transaction) = &mut self.active_transaction {
      active_transaction.push(action);
    } else {
      self.undo_stack.push(HistoryEntry::Single(action));
    }

    self.redo_stack.clear();
  }

  /// Pushes a checkpoint to the undo stack.
  /// Does nothing if the last entry is already a checkpoint.
  pub fn push_checkpoint(&mut self) {
    if self
      .undo_stack
      .last()
      .is_some_and(|entry| matches!(entry, HistoryEntry::Checkpoint))
    {
      return;
    }
    self.undo_stack.push(HistoryEntry::Checkpoint);
    self.redo_stack.clear();
  }

  /// Undoes the last action and return the events produced by the revoke.
  /// Returns `None` if there is nothing to undo (empty stack or only a checkpoint).
  pub fn undo(&mut self, patproj: &mut PatternProject) -> Result<Option<Vec<EditorEvent>>> {
    if self.undo_stack.len() == 1 && matches!(self.undo_stack.last(), Some(HistoryEntry::Checkpoint)) {
      return Ok(None);
    }

    if self.active_transaction.is_some() {
      self.end_transaction();
    }

    if let Some(entry) = self.undo_stack.last_mut() {
      match entry {
        HistoryEntry::Checkpoint => {
          // Remove the checkpoint and push it to redo, then undo the next real action.
          let checkpoint = self.undo_stack.pop().unwrap();
          self.redo_stack.push(checkpoint);
          return self.undo(patproj);
        }
        HistoryEntry::Single(_) => {
          let HistoryEntry::Single(mut action) = self.undo_stack.pop().unwrap() else {
            unreachable!()
          };
          let events = action.revoke(patproj)?;
          self.redo_stack.push(HistoryEntry::Single(action));
          return Ok(Some(events));
        }
        HistoryEntry::Transaction(transaction) => {
          if let Some(mut action) = transaction.actions.pop() {
            let events = action.revoke(patproj)?;
            match self.redo_stack.last_mut() {
              Some(HistoryEntry::Transaction(last_t)) if last_t.id == transaction.id => {
                last_t.actions.push(action);
              }
              _ => {
                self.redo_stack.push(HistoryEntry::Transaction(Transaction {
                  id: transaction.id,
                  actions: vec![action],
                }));
              }
            }
            if transaction.actions.is_empty() {
              self.undo_stack.pop();
            }
            return Ok(Some(events));
          }
          unreachable!("The undo stack should not contain empty transactions.");
        }
      }
    }

    Ok(None)
  }

  /// Redoes the last undone action and returns the events produced by the perform.
  /// Returns `None` if there is nothing to redo.
  pub fn redo(&mut self, patproj: &mut PatternProject) -> Result<Option<Vec<EditorEvent>>> {
    if let Some(entry) = self.redo_stack.last_mut() {
      match entry {
        HistoryEntry::Checkpoint => {
          // The checkpoint sits at the top, so we've already redone everything above it.
          // Absorb it back into the undo stack and try the next entry.
          self.undo_stack.push(self.redo_stack.pop().unwrap());
          return self.redo(patproj);
        }
        HistoryEntry::Single(_) => {
          let HistoryEntry::Single(mut action) = self.redo_stack.pop().unwrap() else {
            unreachable!()
          };
          let events = action.perform(patproj)?;
          self.undo_stack.push(HistoryEntry::Single(action));

          // If the next item in the redo stack is a checkpoint, absorb it into the undo stack.
          if matches!(self.redo_stack.last(), Some(HistoryEntry::Checkpoint)) {
            self.undo_stack.push(self.redo_stack.pop().unwrap());
          }

          return Ok(Some(events));
        }
        HistoryEntry::Transaction(transaction) => {
          if let Some(mut action) = transaction.actions.pop() {
            let events = action.perform(patproj)?;
            match self.undo_stack.last_mut() {
              Some(HistoryEntry::Transaction(last_t)) if last_t.id == transaction.id => {
                last_t.actions.push(action);
              }
              _ => {
                self.undo_stack.push(HistoryEntry::Transaction(Transaction {
                  id: transaction.id,
                  actions: vec![action],
                }));
              }
            }
            if transaction.actions.is_empty() {
              self.redo_stack.pop();

              // If the next item in the redo stack is a checkpoint, absorb it into the undo stack.
              if matches!(self.redo_stack.last(), Some(HistoryEntry::Checkpoint)) {
                self.undo_stack.push(self.redo_stack.pop().unwrap());
              }
            }
            return Ok(Some(events));
          }
          unreachable!("The redo stack should not contain empty transactions.");
        }
      }
    }
    Ok(None)
  }

  /// Undoes the last transaction (or single action) atomically.
  /// Returns all events from revoking all actions in the entry.
  pub fn undo_transaction(&mut self, patproj: &mut PatternProject) -> Result<Option<Vec<EditorEvent>>> {
    if self.undo_stack.len() == 1 && matches!(self.undo_stack.last(), Some(HistoryEntry::Checkpoint)) {
      return Ok(None);
    }

    // Skip a checkpoint at the top before proceeding.
    if matches!(self.undo_stack.last(), Some(HistoryEntry::Checkpoint)) {
      let checkpoint = self.undo_stack.pop().unwrap();
      self.redo_stack.push(checkpoint);
    }

    if let Some(entry) = self.undo_stack.last() {
      match entry {
        HistoryEntry::Checkpoint => unreachable!(),
        HistoryEntry::Single(_) => {
          return self.undo(patproj);
        }
        HistoryEntry::Transaction(_) => {
          let HistoryEntry::Transaction(mut transaction) = self.undo_stack.pop().unwrap() else {
            unreachable!()
          };

          let mut all_events = Vec::new();
          // Revoke in reverse order.
          let reversed: Vec<EditorAction> = transaction.actions.drain(..).rev().collect();
          let mut revoked = Vec::new();
          for mut action in reversed {
            let events = action.revoke(patproj)?;
            all_events.extend(events);
            revoked.push(action);
          }

          // Push to redo in original order.
          match self.redo_stack.last_mut() {
            Some(HistoryEntry::Transaction(last_t)) if last_t.id == transaction.id => {
              last_t.actions.extend(revoked);
            }
            _ => {
              self.redo_stack.push(HistoryEntry::Transaction(Transaction {
                id: transaction.id,
                actions: revoked,
              }));
            }
          }

          return Ok(Some(all_events));
        }
      }
    }
    Ok(None)
  }

  /// Redoes the last undone transaction (or single action) atomically.
  /// Returns all events from performing all actions in the entry.
  pub fn redo_transaction(&mut self, patproj: &mut PatternProject) -> Result<Option<Vec<EditorEvent>>> {
    if let Some(entry) = self.redo_stack.last() {
      match entry {
        HistoryEntry::Checkpoint => {
          // The checkpoint sits at the top, so we've already redone everything above it.
          // Absorb it back into the undo stack and try the next entry.
          self.undo_stack.push(self.redo_stack.pop().unwrap());
          return self.redo_transaction(patproj);
        }
        HistoryEntry::Single(_) => {
          return self.redo(patproj);
        }
        HistoryEntry::Transaction(_) => {
          let HistoryEntry::Transaction(mut transaction) = self.redo_stack.pop().unwrap() else {
            unreachable!()
          };

          let mut all_events = Vec::new();
          let reversed: Vec<EditorAction> = transaction.actions.drain(..).rev().collect();
          let mut performed = Vec::new();
          for mut action in reversed {
            let events = action.perform(patproj)?;
            all_events.extend(events);
            performed.push(action);
          }

          // Push to undo in original order.
          match self.undo_stack.last_mut() {
            Some(HistoryEntry::Transaction(last_t)) if last_t.id == transaction.id => {
              last_t.actions.extend(performed);
            }
            _ => {
              self.undo_stack.push(HistoryEntry::Transaction(Transaction {
                id: transaction.id,
                actions: performed,
              }));
            }
          }

          // If the next item in the redo stack is a checkpoint, absorb it into the undo stack.
          if matches!(self.redo_stack.last(), Some(HistoryEntry::Checkpoint)) {
            self.undo_stack.push(self.redo_stack.pop().unwrap());
          }

          return Ok(Some(all_events));
        }
      }
    }
    Ok(None)
  }

  /// Checks if there are any unsaved changes (i.e., the top of the undo stack is not a checkpoint).
  #[must_use]
  pub fn has_unsaved_changes(&self) -> bool {
    !self
      .undo_stack
      .last()
      .is_none_or(|entry| matches!(entry, HistoryEntry::Checkpoint))
  }
}
