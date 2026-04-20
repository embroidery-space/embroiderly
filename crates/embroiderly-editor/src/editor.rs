use std::collections::HashMap;

use embroiderly_pattern::PatternProject;

use crate::EditorEvent;
use crate::actions::EditorAction;
use crate::error::{Error, Result};
use crate::history::History;

#[cfg(test)]
#[path = "editor.test.rs"]
mod tests;

/// The unified editor object that owns all open pattern projects and their edit history.
#[derive(Default)]
pub struct Editor {
  patterns: HashMap<uuid::Uuid, PatternProject>,
  histories: HashMap<uuid::Uuid, History>,
}

impl Editor {
  #[must_use]
  pub fn new() -> Self {
    Self::default()
  }

  /// Adds a pattern project to the editor. Returns its UUID.
  pub fn add_pattern(&mut self, patproj: PatternProject) -> uuid::Uuid {
    let id = patproj.id;

    self.histories.entry(id).or_default();
    self.patterns.insert(id, patproj);

    id
  }

  /// Removes a pattern project from the editor. Returns the project if it existed.
  pub fn remove_pattern(&mut self, id: &uuid::Uuid) -> Option<PatternProject> {
    self.histories.remove(id);
    self.patterns.remove(id)
  }

  /// Returns a reference to the pattern project.
  #[must_use]
  pub fn get_pattern(&self, id: &uuid::Uuid) -> Option<&PatternProject> {
    self.patterns.get(id)
  }

  /// Returns a mutable reference to the pattern project.
  pub fn get_pattern_mut(&mut self, id: &uuid::Uuid) -> Option<&mut PatternProject> {
    self.patterns.get_mut(id)
  }

  /// Performs an action on the pattern project.
  /// All changes are stored in the actions history.
  /// Returns the resulted events to which the caller should react on their side.
  pub fn dispatch(&mut self, id: &uuid::Uuid, mut action: EditorAction) -> Result<Vec<EditorEvent>> {
    let patproj = self.patterns.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    let events = action.perform(patproj)?;

    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    history.push(action);

    Ok(events)
  }

  /// Undoes the last action on the pattern project.
  pub fn undo(&mut self, id: &uuid::Uuid) -> Result<Vec<EditorEvent>> {
    let patproj = self.patterns.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    Ok(history.undo(patproj)?.unwrap_or_default())
  }

  /// Redoes the last undone action on the pattern project.
  pub fn redo(&mut self, id: &uuid::Uuid) -> Result<Vec<EditorEvent>> {
    let patproj = self.patterns.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    Ok(history.redo(patproj)?.unwrap_or_default())
  }

  /// Undoes the last transaction on the pattern project.
  pub fn undo_transaction(&mut self, id: &uuid::Uuid) -> Result<Vec<EditorEvent>> {
    let patproj = self.patterns.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    Ok(history.undo_transaction(patproj)?.unwrap_or_default())
  }

  /// Redoes the last undone transaction on the pattern project.
  pub fn redo_transaction(&mut self, id: &uuid::Uuid) -> Result<Vec<EditorEvent>> {
    let patproj = self.patterns.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    Ok(history.redo_transaction(patproj)?.unwrap_or_default())
  }

  /// Starts a new transaction on the pattern project.
  pub fn start_transaction(&mut self, id: &uuid::Uuid) -> Result<()> {
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    history.start_transaction();
    Ok(())
  }

  /// Ends the current transaction on the pattern project.
  pub fn end_transaction(&mut self, id: &uuid::Uuid) -> Result<()> {
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    history.end_transaction();
    Ok(())
  }

  /// Records a checkpoint (save point) for the pattern. Used for tracking unsaved changes.
  pub fn checkpoint(&mut self, id: &uuid::Uuid) -> Result<()> {
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    history.push_checkpoint();
    Ok(())
  }

  /// Checks if the pattern has unsaved changes.
  pub fn has_unsaved_changes(&self, id: &uuid::Uuid) -> Result<bool> {
    let history = self.histories.get(id).ok_or(Error::PatternNotFound(*id))?;
    Ok(history.has_unsaved_changes())
  }
}
