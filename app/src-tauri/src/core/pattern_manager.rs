use std::collections::HashMap;

use embroiderly_pattern::PatternProject;

#[cfg(test)]
#[path = "pattern_manager.test.rs"]
mod tests;

pub struct PatternManager {
  patterns_by_id: HashMap<uuid::Uuid, PatternProject>,
  id_by_path: HashMap<std::path::PathBuf, uuid::Uuid>,
}

impl PatternManager {
  #[expect(clippy::new_without_default)]
  #[must_use]
  pub fn new() -> Self {
    Self {
      patterns_by_id: HashMap::new(),
      id_by_path: HashMap::new(),
    }
  }

  pub fn patterns(&self) -> impl Iterator<Item = &PatternProject> {
    self.patterns_by_id.values()
  }

  #[must_use]
  pub fn len(&self) -> usize {
    self.patterns_by_id.len()
  }

  #[must_use]
  pub fn is_empty(&self) -> bool {
    self.patterns_by_id.is_empty()
  }

  pub fn add_pattern(&mut self, pattern: PatternProject) {
    if let Some(ref file_path) = pattern.file_path {
      self.id_by_path.insert(file_path.clone(), pattern.id);
    }
    self.patterns_by_id.insert(pattern.id, pattern);
  }

  #[must_use]
  pub fn get_pattern_by_id(&self, id: &uuid::Uuid) -> Option<&PatternProject> {
    self.patterns_by_id.get(id)
  }

  pub fn get_mut_pattern_by_id(&mut self, id: &uuid::Uuid) -> Option<&mut PatternProject> {
    self.patterns_by_id.get_mut(id)
  }

  #[must_use]
  pub fn get_pattern_by_path(&self, path: &std::path::PathBuf) -> Option<&PatternProject> {
    self.id_by_path.get(path).and_then(|id| self.patterns_by_id.get(id))
  }

  pub fn remove_pattern(&mut self, id: &uuid::Uuid) -> Option<PatternProject> {
    let pattern = self.patterns_by_id.remove(id);
    if let Some(pattern) = &pattern
      && let Some(ref file_path) = pattern.file_path
    {
      self.id_by_path.remove(file_path);
    }
    pattern
  }
}
