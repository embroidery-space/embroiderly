use std::collections::HashMap;

use crate::core::history::History;
pub use crate::core::pattern_manager::PatternManager;

pub struct HistoryManager<R: tauri::Runtime> {
  inner: HashMap<uuid::Uuid, History<R>>,
}

impl<R: tauri::Runtime> HistoryManager<R> {
  #[expect(clippy::new_without_default)]
  #[must_use]
  pub fn new() -> Self {
    Self { inner: HashMap::new() }
  }

  /// Creates a new history entry for the given pattern ID.
  /// If history already exists for this pattern, this is a no-op.
  pub fn create(&mut self, id: uuid::Uuid) {
    self.inner.insert(id, History::new());
  }

  #[must_use]
  pub fn get(&self, id: &uuid::Uuid) -> Option<&History<R>> {
    self.inner.get(id)
  }

  pub fn get_mut(&mut self, id: &uuid::Uuid) -> Option<&mut History<R>> {
    self.inner.get_mut(id)
  }

  pub fn remove(&mut self, id: &uuid::Uuid) -> Option<History<R>> {
    self.inner.remove(id)
  }

  pub fn iter(&self) -> impl Iterator<Item = (&uuid::Uuid, &History<R>)> {
    self.inner.iter()
  }
}

/// Stores notifications generated during startup for later retrieval by the frontend.
pub struct StartupNotifications {
  inner: Vec<StartupNotification>,
}

impl StartupNotifications {
  /// Creates a new instance of `StartupNotifications`.
  #[expect(clippy::new_without_default)]
  #[must_use]
  pub const fn new() -> Self {
    Self { inner: Vec::new() }
  }

  /// Adds a new notification to the list.
  pub fn push(&mut self, notification: StartupNotification) {
    self.inner.push(notification);
  }

  /// Takes all notifications, clearing the internal storage.
  pub fn take_all(&mut self) -> Vec<StartupNotification> {
    std::mem::take(&mut self.inner)
  }
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub enum StartupNotification {
  FileAssociationFailed(std::path::PathBuf),
  TemplateFailed(std::path::PathBuf),
}

pub type PatternsState = std::sync::RwLock<PatternManager>;
pub type HistoryState<R> = std::sync::RwLock<HistoryManager<R>>;
pub type StartupNotificationsState = std::sync::Mutex<StartupNotifications>;
