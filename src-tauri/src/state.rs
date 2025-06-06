use std::collections::HashMap;

use crate::core::history::History;
use crate::core::pattern_manager::PatternManager;

pub struct HistoryStateInner<R: tauri::Runtime> {
  inner: HashMap<uuid::Uuid, History<R>>,
}

impl<R: tauri::Runtime> HistoryStateInner<R> {
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

  pub fn iter(&self) -> impl Iterator<Item = (&uuid::Uuid, &History<R>)> {
    self.inner.iter()
  }
}

pub type PatternsState = std::sync::RwLock<PatternManager>;
pub type HistoryState<R> = std::sync::RwLock<HistoryStateInner<R>>;
