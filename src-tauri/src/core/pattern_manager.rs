use std::collections::HashMap;

use super::pattern::PatternProject;

#[cfg(test)]
#[path = "pattern_manager.test.rs"]
mod tests;

pub struct PatternManager {
  patterns_by_id: HashMap<uuid::Uuid, PatternProject>,
  id_by_path: HashMap<std::path::PathBuf, uuid::Uuid>,
}

impl PatternManager {
  #[allow(clippy::new_without_default)]
  pub fn new() -> Self {
    Self {
      patterns_by_id: HashMap::new(),
      id_by_path: HashMap::new(),
    }
  }

  pub fn add_pattern(&mut self, pattern: PatternProject) {
    self.id_by_path.insert(pattern.file_path.clone(), pattern.id);
    self.patterns_by_id.insert(pattern.id, pattern);
  }

  pub fn get_pattern_by_id(&self, id: &uuid::Uuid) -> Option<&PatternProject> {
    self.patterns_by_id.get(id)
  }

  pub fn get_mut_pattern_by_id(&mut self, id: &uuid::Uuid) -> Option<&mut PatternProject> {
    self.patterns_by_id.get_mut(id)
  }

  pub fn get_pattern_by_path(&self, path: &std::path::PathBuf) -> Option<&PatternProject> {
    self.id_by_path.get(path).and_then(|id| self.patterns_by_id.get(id))
  }

  pub fn remove_pattern(&mut self, id: &uuid::Uuid) -> Option<PatternProject> {
    let pattern = self.patterns_by_id.remove(id);
    if let Some(pattern) = &pattern {
      self.id_by_path.remove(&pattern.file_path);
    }
    pattern
  }
}
