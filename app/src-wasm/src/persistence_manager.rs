use wasm_bindgen::prelude::*;

use crate::error::Error;
use crate::web::{idb, opfs};

const DB_NAME: &str = "embroiderly";
const DB_VERSION: u32 = 1;

const HANDLE_STORE: &str = "handles";

/// Manages persistent browser-side storage for the editor via IndexedDB.
pub struct PersistenceManager {
  db: idb::Database<anyhow::Error>,
}

impl PersistenceManager {
  /// Opens (or creates) the IndexedDB database and returns the `PersistenceManager` instance.
  pub async fn create() -> Result<Self, Error> {
    let factory = idb::Factory::<anyhow::Error>::get().map_err(|e| anyhow::anyhow!("{e}"))?;
    let db = factory
      .open(DB_NAME, DB_VERSION, |evt| async move {
        if evt.old_version() < 1 {
          evt.database().build_object_store(HANDLE_STORE).create()?;
        }
        Ok(())
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(Self { db })
  }

  /// Persists the file handle associated with the given pattern ID.
  #[tracing::instrument(name = "PersistenceManager::save_handle", level = "debug", skip(self, handle), err)]
  pub async fn save_handle(&self, id: uuid::Uuid, handle: opfs::FileHandle) -> Result<(), Error> {
    let key = JsValue::from_str(&id.to_string());
    let value: JsValue = handle.into_inner().into();
    self
      .db
      .transaction(&[HANDLE_STORE])
      .rw()
      .run(move |tx| async move {
        let store = tx.object_store(HANDLE_STORE)?;
        store.put_kv(&key, &value).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(())
  }

  /// Returns the file handle associated with the given pattern ID, or `None` if not found.
  #[tracing::instrument(name = "PersistenceManager::get_handle", level = "debug", skip(self), err)]
  pub async fn get_handle(&self, id: uuid::Uuid) -> Result<Option<opfs::FileHandle>, Error> {
    let key = JsValue::from_str(&id.to_string());
    let result = self
      .db
      .transaction(&[HANDLE_STORE])
      .run(move |tx| async move {
        let store = tx.object_store(HANDLE_STORE)?;
        store.get(&key).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(result.map(|v| opfs::FileHandle::from(v.unchecked_into::<web_sys::FileSystemFileHandle>())))
  }

  /// Removes the file handle associated with the given pattern ID.
  #[tracing::instrument(name = "PersistenceManager::remove_handle", level = "debug", skip(self), err)]
  pub async fn remove_handle(&self, id: uuid::Uuid) -> Result<(), Error> {
    let key = JsValue::from_str(&id.to_string());
    self
      .db
      .transaction(&[HANDLE_STORE])
      .rw()
      .run(move |tx| async move {
        let store = tx.object_store(HANDLE_STORE)?;
        store.delete(&key).await
      })
      .await
      .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(())
  }
}
