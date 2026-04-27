use wasm_bindgen::prelude::*;

use crate::error::Error;
use crate::web::{idb, opfs};

const DB_NAME: &str = "embroiderly";
const DB_VERSION: u32 = 1;

const PATTERN_STORE: &str = "patterns";
const JOURNAL_STORE: &str = "journal";
const JOURNAL_BY_PATTERN_INDEX: &str = "by_pattern";

pub struct PatternEntry {
  pub pattern_id: String,
  pub handle: Option<JsValue>,
  pub data: Vec<u8>,
}

impl From<PatternEntry> for JsValue {
  fn from(entry: PatternEntry) -> Self {
    let obj = js_sys::Object::new();
    let set = |k: &str, v: Self| js_sys::Reflect::set(&obj, &k.into(), &v).unwrap();
    set("pattern_id", entry.pattern_id.into());
    set("handle", entry.handle.unwrap_or(Self::null()));
    set("data", js_sys::Uint8Array::from(entry.data.as_slice()).into());
    obj.into()
  }
}

impl TryFrom<JsValue> for PatternEntry {
  type Error = anyhow::Error;
  fn try_from(val: JsValue) -> Result<Self, Self::Error> {
    let get = |k: &str| js_sys::Reflect::get(&val, &k.into()).ok();
    let pattern_id = get("pattern_id")
      .and_then(|v| v.as_string())
      .ok_or_else(|| anyhow::anyhow!("pattern entry missing pattern_id"))?;
    let handle = get("handle").filter(|v| !v.is_null() && !v.is_undefined());
    let data = get("data")
      .and_then(|v| v.dyn_into::<js_sys::Uint8Array>().ok())
      .map(|arr| arr.to_vec())
      .ok_or_else(|| anyhow::anyhow!("pattern entry missing data"))?;
    Ok(Self {
      pattern_id,
      handle,
      data,
    })
  }
}

struct JournalEntry {
  pattern_id: String,
  action: Vec<u8>,
}

impl From<JournalEntry> for JsValue {
  fn from(entry: JournalEntry) -> Self {
    let obj = js_sys::Object::new();
    let set = |k: &str, v: Self| js_sys::Reflect::set(&obj, &k.into(), &v).unwrap();
    set("pattern_id", entry.pattern_id.into());
    set("action", js_sys::Uint8Array::from(entry.action.as_slice()).into());
    obj.into()
  }
}

impl TryFrom<JsValue> for JournalEntry {
  type Error = anyhow::Error;
  fn try_from(val: JsValue) -> Result<Self, Self::Error> {
    let get = |k: &str| js_sys::Reflect::get(&val, &k.into()).ok();
    let pattern_id = get("pattern_id")
      .and_then(|v| v.as_string())
      .ok_or_else(|| anyhow::anyhow!("journal entry missing pattern_id"))?;
    let action = get("action")
      .and_then(|v| v.dyn_into::<js_sys::Uint8Array>().ok())
      .map(|arr| arr.to_vec())
      .ok_or_else(|| anyhow::anyhow!("journal entry missing action"))?;
    Ok(Self { pattern_id, action })
  }
}

/// Manages persistent browser-side storage for the editor via IndexedDB.
pub struct PersistenceManager {
  db: idb::Database<anyhow::Error>,
}

impl PersistenceManager {
  /// Opens (or creates) the IndexedDB database.
  pub async fn create() -> Result<Self, Error> {
    let factory = idb::Factory::<anyhow::Error>::get().map_err(|e| anyhow::anyhow!("{e}"))?;
    let db = factory
      .open(DB_NAME, DB_VERSION, |evt| async move {
        let db = evt.database();
        if evt.old_version() < 1 {
          db.build_object_store(PATTERN_STORE).key_path("pattern_id").create()?;

          let journal_store = db.build_object_store(JOURNAL_STORE).auto_increment().create()?;
          journal_store
            .build_index(JOURNAL_BY_PATTERN_INDEX, "pattern_id")
            .create()?;
        }
        Ok(())
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(Self { db })
  }

  /// Saves the pattern handle and data as a single entry.
  #[tracing::instrument(
    name = "PersistenceManager::save_pattern_entry",
    level = "debug",
    skip(self, handle, data),
    err
  )]
  pub async fn save_pattern_entry(
    &self,
    pattern_id: uuid::Uuid,
    handle: Option<opfs::FileHandle>,
    data: Vec<u8>,
  ) -> Result<(), Error> {
    let entry = JsValue::from(PatternEntry {
      pattern_id: pattern_id.to_string(),
      handle: handle.map(|h| h.into_inner().into()),
      data,
    });
    self
      .db
      .transaction(&[PATTERN_STORE])
      .rw()
      .run(move |tx| async move {
        let store = tx.object_store(PATTERN_STORE)?;
        store.put(&entry).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(())
  }

  /// Updates the stored file handle for an existing pattern entry, preserving the snapshot data.
  #[tracing::instrument(name = "PersistenceManager::update_handle", level = "debug", skip(self, handle), err)]
  pub async fn update_handle(&self, pattern_id: uuid::Uuid, handle: opfs::FileHandle) -> Result<(), Error> {
    let pattern_id = pattern_id.to_string();
    let handle: JsValue = handle.into_inner().into();
    self
      .db
      .transaction(&[PATTERN_STORE])
      .rw()
      .run(move |tx| async move {
        let store = tx.object_store(PATTERN_STORE)?;

        let key = JsValue::from_str(&pattern_id);
        let existing = store.get(&key).await?;

        let data = existing
          .and_then(|v| PatternEntry::try_from(v).ok())
          .map(|e| e.data)
          .unwrap_or_default();

        store
          .put(&JsValue::from(PatternEntry {
            pattern_id,
            handle: Some(handle),
            data,
          }))
          .await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(())
  }

  /// Returns the file handle associated with the given pattern ID, or `None` if not found.
  #[tracing::instrument(name = "PersistenceManager::get_handle", level = "debug", skip(self), err)]
  pub async fn get_handle(&self, pattern_id: uuid::Uuid) -> Result<Option<opfs::FileHandle>, Error> {
    let key = JsValue::from_str(&pattern_id.to_string());
    let result = self
      .db
      .transaction(&[PATTERN_STORE])
      .run(move |tx| async move {
        let store = tx.object_store(PATTERN_STORE)?;
        store.get(&key).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;

    let handle = result
      .and_then(|v| PatternEntry::try_from(v).ok())
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

  /// Deletes the pattern entry (handle + snapshot) for the given pattern ID.
  #[tracing::instrument(name = "PersistenceManager::remove_pattern_entry", level = "debug", skip(self), err)]
  pub async fn remove_pattern_entry(&self, pattern_id: uuid::Uuid) -> Result<(), Error> {
    let key = JsValue::from_str(&pattern_id.to_string());
    self
      .db
      .transaction(&[PATTERN_STORE])
      .rw()
      .run(move |tx| async move {
        let store = tx.object_store(PATTERN_STORE)?;
        store.delete(&key).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(())
  }

  /// Loads all stored pattern entries.
  #[tracing::instrument(
    name = "PersistenceManager::load_all_pattern_entries",
    level = "debug",
    skip(self),
    err
  )]
  pub async fn load_all_pattern_entries(&self) -> Result<Vec<PatternEntry>, Error> {
    let rows = self
      .db
      .transaction(&[PATTERN_STORE])
      .run(move |tx| async move {
        let store = tx.object_store(PATTERN_STORE)?;
        store.get_all(None).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;

    let mut entries = Vec::with_capacity(rows.len());
    for row in rows {
      entries.push(PatternEntry::try_from(row)?);
    }

    Ok(entries)
  }

  /// Appends a single journal action for the given pattern ID.
  #[tracing::instrument(
    name = "PersistenceManager::append_journal_entry",
    level = "debug",
    skip(self, action),
    err
  )]
  pub async fn append_journal_entry(&self, pattern_id: uuid::Uuid, action: Vec<u8>) -> Result<(), Error> {
    let entry = JsValue::from(JournalEntry {
      pattern_id: pattern_id.to_string(),
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

  /// Loads all journal actions for the given pattern ID in insertion order.
  #[tracing::instrument(name = "PersistenceManager::load_journal_entries", level = "debug", skip(self), err)]
  pub async fn load_journal_entries(&self, pattern_id: uuid::Uuid) -> Result<Vec<Vec<u8>>, Error> {
    let pattern_id = JsValue::from_str(&pattern_id.to_string());
    let rows = self
      .db
      .transaction(&[JOURNAL_STORE])
      .run(move |tx| async move {
        let store = tx.object_store(JOURNAL_STORE)?;
        let index = store.index(JOURNAL_BY_PATTERN_INDEX)?;
        index.get_all_in(pattern_id.clone()..=pattern_id, None).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;

    let mut actions = Vec::with_capacity(rows.len());
    for row in rows {
      actions.push(JournalEntry::try_from(row)?.action);
    }

    Ok(actions)
  }

  /// Deletes all journal entries for the given pattern ID.
  #[tracing::instrument(name = "PersistenceManager::clear_journal", level = "debug", skip(self), err)]
  pub async fn clear_journal(&self, pattern_id: uuid::Uuid) -> Result<(), Error> {
    let pattern_id = JsValue::from_str(&pattern_id.to_string());
    self
      .db
      .transaction(&[JOURNAL_STORE])
      .rw()
      .run(move |tx| async move {
        let store = tx.object_store(JOURNAL_STORE)?;
        let index = store.index(JOURNAL_BY_PATTERN_INDEX)?;

        let keys = index.get_all_keys_in(pattern_id.clone()..=pattern_id, None).await?;
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
