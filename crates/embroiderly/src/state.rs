use std::collections::HashMap;

use crate::core::history::History;
pub use crate::core::pattern_manager::PatternManager;

pub struct HistoryManager<R: tauri::Runtime> {
  inner: HashMap<uuid::Uuid, History<R>>,
}

impl<R: tauri::Runtime> HistoryManager<R> {
  #[allow(clippy::new_without_default)]
  pub fn new() -> Self {
    Self { inner: HashMap::new() }
  }

  pub fn get(&self, id: &uuid::Uuid) -> Option<&History<R>> {
    self.inner.get(id)
  }

  pub fn get_mut(&mut self, id: &uuid::Uuid) -> &mut History<R> {
    self.inner.entry(*id).or_default()
  }

  pub fn remove(&mut self, id: &uuid::Uuid) -> Option<History<R>> {
    self.inner.remove(id)
  }

  pub fn iter(&self) -> impl Iterator<Item = (&uuid::Uuid, &History<R>)> {
    self.inner.iter()
  }
}

pub type PatternsState = std::sync::RwLock<PatternManager>;
pub type HistoryState<R> = std::sync::RwLock<HistoryManager<R>>;
