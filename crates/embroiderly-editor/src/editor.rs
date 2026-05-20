use std::collections::HashMap;

use embroiderly_pattern::{EmbroiderlyProject, EmbroiderlyProjectId};

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
  projects: HashMap<EmbroiderlyProjectId, EmbroiderlyProject>,
  histories: HashMap<EmbroiderlyProjectId, History>,
}

impl Editor {
  #[must_use]
  pub fn new() -> Self {
    Self::default()
  }

  /// Returns the IDs of all open patterns.
  #[must_use]
  pub fn project_ids(&self) -> Vec<EmbroiderlyProjectId> {
    self.projects.keys().copied().collect()
  }

  /// Adds a pattern project to the editor. Returns its UUID.
  pub fn add_pattern(&mut self, embproj: EmbroiderlyProject) -> EmbroiderlyProjectId {
    let id = embproj.id;

    self.histories.entry(id).or_default();
    self.projects.insert(id, embproj);

    id
  }

  /// Removes a pattern project from the editor. Returns the project if it existed.
  pub fn remove_pattern(&mut self, id: &EmbroiderlyProjectId) -> Option<EmbroiderlyProject> {
    self.histories.remove(id);
    self.projects.remove(id)
  }

  /// Returns a reference to the pattern project.
  #[must_use]
  pub fn get_pattern(&self, id: &EmbroiderlyProjectId) -> Option<&EmbroiderlyProject> {
    self.projects.get(id)
  }

  /// Returns a mutable reference to the pattern project.
  pub fn get_pattern_mut(&mut self, id: &EmbroiderlyProjectId) -> Option<&mut EmbroiderlyProject> {
    self.projects.get_mut(id)
  }

  /// Performs an action on the pattern project.
  /// All changes are stored in the actions history.
  /// Returns the resulted events to which the caller should react on their side.
  pub fn dispatch(&mut self, id: &EmbroiderlyProjectId, mut action: EditorAction) -> Result<Vec<EditorEvent>> {
    let embproj = self.projects.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    let events = action.perform(embproj)?;

    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    history.push(action);

    Ok(events)
  }

  /// Undoes the last action on the pattern project.
  pub fn undo(&mut self, id: &EmbroiderlyProjectId) -> Result<Vec<EditorEvent>> {
    let embproj = self.projects.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    Ok(history.undo(embproj)?.unwrap_or_default())
  }

  /// Redoes the last undone action on the pattern project.
  pub fn redo(&mut self, id: &EmbroiderlyProjectId) -> Result<Vec<EditorEvent>> {
    let embproj = self.projects.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    Ok(history.redo(embproj)?.unwrap_or_default())
  }

  /// Undoes the last transaction on the pattern project.
  pub fn undo_transaction(&mut self, id: &EmbroiderlyProjectId) -> Result<Vec<EditorEvent>> {
    let embproj = self.projects.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    Ok(history.undo_transaction(embproj)?.unwrap_or_default())
  }

  /// Redoes the last undone transaction on the pattern project.
  pub fn redo_transaction(&mut self, id: &EmbroiderlyProjectId) -> Result<Vec<EditorEvent>> {
    let embproj = self.projects.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    Ok(history.redo_transaction(embproj)?.unwrap_or_default())
  }

  /// Starts a new transaction on the pattern project.
  pub fn start_transaction(&mut self, id: &EmbroiderlyProjectId) -> Result<()> {
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    history.start_transaction();
    Ok(())
  }

  /// Ends the current transaction on the pattern project.
  pub fn end_transaction(&mut self, id: &EmbroiderlyProjectId) -> Result<()> {
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    history.end_transaction();
    Ok(())
  }

  /// Records a checkpoint (save point) for the pattern. Used for tracking unsaved changes.
  pub fn checkpoint(&mut self, id: &EmbroiderlyProjectId) -> Result<()> {
    let history = self.histories.get_mut(id).ok_or(Error::PatternNotFound(*id))?;
    history.push_checkpoint();
    Ok(())
  }

  /// Checks if the pattern has unsaved changes.
  pub fn has_unsaved_changes(&self, id: &EmbroiderlyProjectId) -> Result<bool> {
    let history = self.histories.get(id).ok_or(Error::PatternNotFound(*id))?;
    Ok(history.has_unsaved_changes())
  }
}
