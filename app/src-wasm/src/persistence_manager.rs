use std::cell::RefCell;
use std::collections::HashMap;

use embroiderly_pattern::EmbroiderlyProjectId;
use embroiderly_web::{idb, opfs};
use wasm_bindgen::prelude::*;

use crate::error::Error;

const DB_NAME: &str = "embroiderly";
const DB_VERSION: u32 = 1;

const PROJECT_STORE: &str = "projects";
const JOURNAL_STORE: &str = "journal";
const JOURNAL_BY_PROJECT_INDEX: &str = "by_project";

pub struct ProjectEntry {
  pub project_id: String,
  pub data: Vec<u8>,
  pub handle: Option<JsValue>,
}

impl From<ProjectEntry> for JsValue {
  fn from(entry: ProjectEntry) -> Self {
    let obj = js_sys::Object::new();
    let set = |k: &str, v: Self| js_sys::Reflect::set(&obj, &k.into(), &v).unwrap();
    set("project_id", entry.project_id.into());
    set("data", js_sys::Uint8Array::from(entry.data.as_slice()).into());
    set("handle", entry.handle.unwrap_or(Self::null()));
    obj.into()
  }
}

impl TryFrom<JsValue> for ProjectEntry {
  type Error = anyhow::Error;
  fn try_from(val: JsValue) -> Result<Self, Self::Error> {
    let get = |k: &str| js_sys::Reflect::get(&val, &k.into()).ok();
    let project_id = get("project_id")
      .and_then(|v| v.as_string())
      .ok_or_else(|| anyhow::anyhow!("project entry missing project_id"))?;
    let data = get("data")
      .and_then(|v| v.dyn_into::<js_sys::Uint8Array>().ok())
      .map(|arr| arr.to_vec())
      .ok_or_else(|| anyhow::anyhow!("project entry missing data"))?;
    let handle = get("handle").filter(|v| !v.is_null() && !v.is_undefined());
    Ok(Self {
      project_id,
      data,
      handle,
    })
  }
}

struct JournalEntry {
  project_id: String,
  action: Vec<u8>,
}

impl From<JournalEntry> for JsValue {
  fn from(entry: JournalEntry) -> Self {
    let obj = js_sys::Object::new();
    let set = |k: &str, v: Self| js_sys::Reflect::set(&obj, &k.into(), &v).unwrap();
    set("project_id", entry.project_id.into());
    set("action", js_sys::Uint8Array::from(entry.action.as_slice()).into());
    obj.into()
  }
}

impl TryFrom<JsValue> for JournalEntry {
  type Error = anyhow::Error;
  fn try_from(val: JsValue) -> Result<Self, Self::Error> {
    let get = |k: &str| js_sys::Reflect::get(&val, &k.into()).ok();
    let project_id = get("project_id")
      .and_then(|v| v.as_string())
      .ok_or_else(|| anyhow::anyhow!("journal entry missing project_id"))?;
    let action = get("action")
      .and_then(|v| v.dyn_into::<js_sys::Uint8Array>().ok())
      .map(|arr| arr.to_vec())
      .ok_or_else(|| anyhow::anyhow!("journal entry missing action"))?;
    Ok(Self { project_id, action })
  }
}

/// Manages persistent browser-side storage for the editor via IndexedDB.
pub struct PersistenceManager {
  /// The underlying IndexedDB database.
  db: idb::Database<anyhow::Error>,

  /// The in-memory project file handles store which is used to:
  /// 1. Avoid re-fetching from IndexedDB on every call.
  /// 2. Maintain the granted permissions (required for auto-save).
  handles: RefCell<HashMap<EmbroiderlyProjectId, opfs::FileHandle>>,
}

impl PersistenceManager {
  /// Opens (or creates) the IndexedDB database.
  pub async fn create() -> Result<Self, Error> {
    let factory = idb::Factory::<anyhow::Error>::get().map_err(|e| anyhow::anyhow!("{e}"))?;
    let db = factory
      .open(DB_NAME, DB_VERSION, |evt| async move {
        let db = evt.database();
        if evt.old_version() < 1 {
          db.build_object_store(PROJECT_STORE).key_path("project_id").create()?;

          let journal_store = db.build_object_store(JOURNAL_STORE).auto_increment().create()?;
          journal_store
            .build_index(JOURNAL_BY_PROJECT_INDEX, "project_id")
            .create()?;
        }
        Ok(())
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(Self {
      db,
      handles: RefCell::new(HashMap::new()),
    })
  }

  /// Returns the stored entry for a single project, or `None` if not found.
  #[tracing::instrument(name = "PersistenceManager::get_project_entry", level = "debug", skip(self), err)]
  pub async fn get_project_entry(&self, project_id: EmbroiderlyProjectId) -> Result<Option<ProjectEntry>, Error> {
    let key = JsValue::from_str(&project_id.to_string());
    let result = self
      .db
      .transaction(&[PROJECT_STORE])
      .run(move |tx| async move {
        let store = tx.object_store(PROJECT_STORE)?;
        store.get(&key).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;

    match result {
      Some(val) => Ok(Some(ProjectEntry::try_from(val)?)),
      None => Ok(None),
    }
  }

  /// Saves the project handle and data as a single entry.
  #[tracing::instrument(
    name = "PersistenceManager::save_project_entry",
    level = "debug",
    skip(self, handle, data),
    err
  )]
  pub async fn save_project_entry(
    &self,
    project_id: EmbroiderlyProjectId,
    data: Vec<u8>,
    handle: Option<opfs::FileHandle>,
  ) -> Result<(), Error> {
    if let Some(h) = &handle {
      self.handles.borrow_mut().insert(project_id, h.clone());
    }

    let entry = JsValue::from(ProjectEntry {
      project_id: project_id.to_string(),
      data,
      handle: handle.map(|h| h.into_inner().into()),
    });
    self
      .db
      .transaction(&[PROJECT_STORE])
      .rw()
      .run(move |tx| async move {
        let store = tx.object_store(PROJECT_STORE)?;
        store.put(&entry).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;

    Ok(())
  }

  /// Returns the file handle associated with the given project ID, or `None` if not found.
  #[tracing::instrument(name = "PersistenceManager::get_handle", level = "debug", skip(self), err)]
  pub async fn get_handle(&self, project_id: EmbroiderlyProjectId) -> Result<Option<opfs::FileHandle>, Error> {
    if let Some(handle) = self.handles.borrow().get(&project_id) {
      return Ok(Some(handle.clone()));
    }

    let key = JsValue::from_str(&project_id.to_string());
    let result = self
      .db
      .transaction(&[PROJECT_STORE])
      .run(move |tx| async move {
        let store = tx.object_store(PROJECT_STORE)?;
        store.get(&key).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;

    let handle = result
      .and_then(|v| ProjectEntry::try_from(v).ok())
      .and_then(|e| e.handle);

    Ok(handle.and_then(|h| {
      // A real FileSystemFileHandle always has a non-empty string `name`.
      // Polyfill-created fakes lose their `WeakMap` backing after IndexedDB round-trips, so `name` comes back as undefined.
      // Treat those as missing handles.
      let has_valid_name = js_sys::Reflect::get(&h, &JsValue::from_str("name"))
        .ok()
        .and_then(|n| n.as_string())
        .is_some_and(|s| !s.is_empty());
      if has_valid_name {
        Some(opfs::FileHandle::from(
          h.unchecked_into::<web_sys::FileSystemFileHandle>(),
        ))
      } else {
        None
      }
    }))
  }

  /// Updates the stored file handle for an existing project entry, preserving the snapshot data.
  #[tracing::instrument(name = "PersistenceManager::update_handle", level = "debug", skip(self, handle), err)]
  pub async fn update_handle(&self, project_id: EmbroiderlyProjectId, handle: opfs::FileHandle) -> Result<(), Error> {
    self.handles.borrow_mut().insert(project_id, handle.clone());

    let project_id = project_id.to_string();
    let handle: JsValue = handle.into_inner().into();
    self
      .db
      .transaction(&[PROJECT_STORE])
      .rw()
      .run(move |tx| async move {
        let store = tx.object_store(PROJECT_STORE)?;

        let key = JsValue::from_str(&project_id);
        let existing = store.get(&key).await?;

        let data = existing
          .and_then(|v| ProjectEntry::try_from(v).ok())
          .map(|e| e.data)
          .unwrap_or_default();

        store
          .put(&JsValue::from(ProjectEntry {
            project_id,
            handle: Some(handle),
            data,
          }))
          .await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;

    Ok(())
  }

  /// Deletes the project entry (handle + snapshot) for the given project ID.
  #[tracing::instrument(name = "PersistenceManager::remove_project_entry", level = "debug", skip(self), err)]
  pub async fn remove_project_entry(&self, project_id: EmbroiderlyProjectId) -> Result<(), Error> {
    self.handles.borrow_mut().remove(&project_id);

    let key = JsValue::from_str(&project_id.to_string());
    self
      .db
      .transaction(&[PROJECT_STORE])
      .rw()
      .run(move |tx| async move {
        let store = tx.object_store(PROJECT_STORE)?;
        store.delete(&key).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;

    Ok(())
  }

  /// Appends a single journal action for the given project ID.
  #[tracing::instrument(
    name = "PersistenceManager::append_journal_entry",
    level = "debug",
    skip(self, action),
    err
  )]
  pub async fn append_journal_entry(&self, project_id: EmbroiderlyProjectId, action: Vec<u8>) -> Result<(), Error> {
    let entry = JsValue::from(JournalEntry {
      project_id: project_id.to_string(),
      action,
    });
    self
      .db
      .transaction(&[JOURNAL_STORE])
      .rw()
      .run(move |tx| async move {
        let store = tx.object_store(JOURNAL_STORE)?;
        store.add(&entry).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(())
  }

  /// Loads all journal actions for the given project ID in insertion order.
  #[tracing::instrument(name = "PersistenceManager::load_journal_entries", level = "debug", skip(self), err)]
  pub async fn load_journal_entries(&self, project_id: EmbroiderlyProjectId) -> Result<Vec<Vec<u8>>, Error> {
    let project_id = JsValue::from_str(&project_id.to_string());
    let rows = self
      .db
      .transaction(&[JOURNAL_STORE])
      .run(move |tx| async move {
        let store = tx.object_store(JOURNAL_STORE)?;
        let index = store.index(JOURNAL_BY_PROJECT_INDEX)?;
        index.get_all_in(project_id.clone()..=project_id, None).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;

    let mut actions = Vec::with_capacity(rows.len());
    for row in rows {
      actions.push(JournalEntry::try_from(row)?.action);
    }

    Ok(actions)
  }

  /// Deletes all journal entries for the given project ID.
  #[tracing::instrument(name = "PersistenceManager::clear_journal", level = "debug", skip(self), err)]
  pub async fn clear_journal(&self, project_id: EmbroiderlyProjectId) -> Result<(), Error> {
    let project_id = JsValue::from_str(&project_id.to_string());
    self
      .db
      .transaction(&[JOURNAL_STORE])
      .rw()
      .run(move |tx| async move {
        let store = tx.object_store(JOURNAL_STORE)?;
        let index = store.index(JOURNAL_BY_PROJECT_INDEX)?;

        let keys = index.get_all_keys_in(project_id.clone()..=project_id, None).await?;
        for key in keys {
          store.delete(&key).await?;
        }

        Ok(())
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(())
  }
}
