use std::cell::RefCell;
use std::rc::Rc;

use embroiderly_editor::actions::layers::LayerVisibility;
use embroiderly_editor::actions::palette::SortPaletteBy;
use embroiderly_editor::actions::{
  DisplayAction, FabricAction, GridAction, ImageAction, LayerAction, PaletteAction, PatternAction, PublishAction,
  StitchAction,
};
use embroiderly_editor::{Editor, EditorAction, EditorEvent};
use embroiderly_parsers::{PackageInfo, PatternFormat};
use embroiderly_pattern::{Pattern, PatternProject, ReferenceImage, Stitch};
use embroiderly_web::{opfs, timers};
use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;

use crate::error::{Error, ErrorKind};
use crate::persistence_manager::PersistenceManager;

thread_local! {
  pub(crate) static EDITOR: RefCell<Option<Editor>> = const { RefCell::new(None) };
}

#[wasm_bindgen(getter_with_clone)]
pub struct OpenPatternResult {
  pub id: String,
  pub title: String,
}

#[derive(borsh::BorshSerialize, borsh::BorshDeserialize)]
enum JournalEntry {
  Action(EditorAction),
  Undo,
  Redo,
  UndoTransaction,
  RedoTransaction,
  StartTransaction,
  EndTransaction,
  Checkpoint,
}

#[wasm_bindgen]
pub struct EditorWrapper {
  callback: js_sys::Function,
  persistence: Rc<PersistenceManager>,
  auto_save_interval: RefCell<Option<timers::Interval>>,
}

// Public methods which delegate the execution to private instrumented implementations.
#[wasm_bindgen]
impl EditorWrapper {
  /// Creates a new `EditorWrapper`.
  pub async fn create(callback: js_sys::Function) -> Result<Self, Error> {
    EDITOR.with(|cell| {
      *cell.borrow_mut() = Some(Editor::new());
    });
    Ok(Self {
      callback,
      persistence: Rc::new(PersistenceManager::create().await?),
      auto_save_interval: RefCell::new(None),
    })
  }

  /// Sets the auto-save interval replacing any existing interval immediately.
  #[wasm_bindgen(js_name = "setAutoSaveInterval")]
  pub fn set_auto_save_interval(&self, millis: u32) {
    self.set_auto_save_interval_impl(millis);
  }

  /// Reads the file from the provided file handle, parses it, and registers the pattern in the editor.
  ///
  /// The file name extension determines the pattern format.
  /// The handle is persisted in IndexedDB so later saves can reuse it.
  ///
  /// Returns `[id, title]` --- the pattern UUID and its title (falling back to the file name if empty).
  #[wasm_bindgen(js_name = "openPattern")]
  pub async fn open_pattern(&self, file_handle: web_sys::FileSystemFileHandle) -> Result<OpenPatternResult, Error> {
    let (id, title) = self.open_pattern_impl(file_handle.into()).await?;
    Ok(OpenPatternResult { id, title })
  }

  /// Parses pattern bytes directly without associating a file handle.
  /// Use this for templates or platform-specific file reads where no `FileSystemFileHandle` is available.
  ///
  /// Returns `[id, title]` --- the pattern UUID and its title (falling back to `file_name` if empty).
  #[wasm_bindgen(js_name = "openPatternFromData")]
  pub async fn open_pattern_from_data(&self, data: &[u8], file_name: &str) -> Result<OpenPatternResult, Error> {
    let (id, title) = self.open_pattern_from_data_impl(data, file_name).await?;
    Ok(OpenPatternResult { id, title })
  }

  /// Creates a blank pattern from the provided Borsh-serialized `Fabric` data.
  /// Returns `[id, title]` --- the pattern UUID and its title.
  #[wasm_bindgen(js_name = "createPattern")]
  pub async fn create_pattern(&self, fabric_data: &[u8]) -> Result<OpenPatternResult, Error> {
    let (id, title) = self.create_pattern_impl(fabric_data).await?;
    Ok(OpenPatternResult { id, title })
  }

  /// Returns the Borsh-serialized `PatternProject`.
  /// If the pattern is not in memory, it is automatically restored from IndexedDB before being returned.
  #[wasm_bindgen(js_name = "loadPattern")]
  pub async fn load_pattern(&self, pattern_id: &str) -> Result<Vec<u8>, Error> {
    self.load_pattern_impl(pattern_id).await
  }

  /// Encodes the pattern and writes it to the associated file handle.
  /// If `handle` is provided it is persisted in IndexedDB and used for this write.
  /// If `handle` is `null` and no handle is stored, returns a `NoFileHandle` error.
  /// Checkpoints the pattern on success.
  #[wasm_bindgen(js_name = "savePattern")]
  pub async fn save_pattern(
    &self,
    pattern_id: &str,
    file_handle: Option<web_sys::FileSystemFileHandle>,
  ) -> Result<(), Error> {
    self.save_pattern_impl(pattern_id, file_handle.map(Into::into)).await
  }

  /// Encodes the pattern and writes it to the given handle without updating the stored handle.
  /// Use this for one-off exports (e.g. OXS). Does not checkpoint.
  #[wasm_bindgen(js_name = "exportPattern")]
  pub async fn export_pattern(
    &self,
    pattern_id: &str,
    file_handle: web_sys::FileSystemFileHandle,
  ) -> Result<(), Error> {
    self.export_pattern_impl(pattern_id, file_handle.into()).await
  }

  /// Removes the pattern from the editor and cleans up its persisted entry from IndexedDB.
  /// Throws an error if the pattern has unsaved changes and `force` is false.
  #[wasm_bindgen(js_name = "closePattern")]
  pub async fn close_pattern(&self, pattern_id: &str, force: bool) -> Result<(), Error> {
    self.close_pattern_impl(pattern_id, force).await
  }

  /// Adds a stitch to the pattern layer.
  #[wasm_bindgen(js_name = "addStitch")]
  pub async fn add_stitch(&self, pattern_id: &str, layer_index: u32, stitch_data: &[u8]) -> Result<(), Error> {
    self.add_stitch_impl(pattern_id, layer_index, stitch_data).await
  }

  /// Removes a stitch from the pattern layer.
  #[wasm_bindgen(js_name = "removeStitch")]
  pub async fn remove_stitch(&self, pattern_id: &str, layer_index: u32, stitch_data: &[u8]) -> Result<(), Error> {
    self.remove_stitch_impl(pattern_id, layer_index, stitch_data).await
  }

  /// Updates fabric properties.
  #[wasm_bindgen(js_name = "updateFabric")]
  pub async fn update_fabric(&self, pattern_id: &str, fabric_data: &[u8]) -> Result<(), Error> {
    self.update_fabric_impl(pattern_id, fabric_data).await
  }

  /// Updates grid properties.
  #[wasm_bindgen(js_name = "updateGrid")]
  pub async fn update_grid(&self, pattern_id: &str, grid_data: &[u8]) -> Result<(), Error> {
    self.update_grid_impl(pattern_id, grid_data).await
  }

  /// Adds a new palette item.
  #[wasm_bindgen(js_name = "addPaletteItem")]
  pub async fn add_palette_item(&self, pattern_id: &str, palitem_data: &[u8]) -> Result<(), Error> {
    self.add_palette_item_impl(pattern_id, palitem_data).await
  }

  /// Removes palette items by their indexes.
  #[wasm_bindgen(js_name = "removePaletteItems")]
  pub async fn remove_palette_items(&self, pattern_id: &str, palindexes: Vec<u32>) -> Result<(), Error> {
    self.remove_palette_items_impl(pattern_id, palindexes).await
  }

  /// Updates palette display settings.
  #[wasm_bindgen(js_name = "updatePaletteDisplaySettings")]
  pub async fn update_palette_display_settings(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    self
      .update_palette_display_settings_impl(pattern_id, settings_data)
      .await
  }

  /// Sorts palette items by the given criterion.
  #[wasm_bindgen(js_name = "sortPalette")]
  pub async fn sort_palette(&self, pattern_id: &str, sort_by: &str) -> Result<(), Error> {
    self.sort_palette_impl(pattern_id, sort_by).await
  }

  /// Reorders a palette item from `old_position` to `new_position`.
  #[wasm_bindgen(js_name = "reorderPaletteItems")]
  pub async fn reorder_palette_items(
    &self,
    pattern_id: &str,
    old_position: u32,
    new_position: u32,
  ) -> Result<(), Error> {
    self
      .reorder_palette_items_impl(pattern_id, old_position, new_position)
      .await
  }

  /// Sets the stitch symbol for a palette item.
  #[wasm_bindgen(js_name = "setPaletteItemSymbol")]
  pub async fn set_palette_item_symbol(&self, pattern_id: &str, symbol_data: &[u8]) -> Result<(), Error> {
    self.set_palette_item_symbol_impl(pattern_id, symbol_data).await
  }

  /// Updates pattern info.
  #[wasm_bindgen(js_name = "updatePatternInfo")]
  pub async fn update_pattern_info(&self, pattern_id: &str, info_data: &[u8]) -> Result<(), Error> {
    self.update_pattern_info_impl(pattern_id, info_data).await
  }

  /// Updates display settings.
  #[wasm_bindgen(js_name = "updateDisplaySettings")]
  pub async fn update_display_settings(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    self.update_display_settings_impl(pattern_id, settings_data).await
  }

  /// Adds a new layer to the pattern.
  #[wasm_bindgen(js_name = "addLayer")]
  pub async fn add_layer(&self, pattern_id: &str) -> Result<(), Error> {
    self.add_layer_impl(pattern_id).await
  }

  /// Removes the layer at the given index.
  #[wasm_bindgen(js_name = "removeLayer")]
  pub async fn remove_layer(&self, pattern_id: &str, layer_index: u32) -> Result<(), Error> {
    self.remove_layer_impl(pattern_id, layer_index).await
  }

  /// Renames the layer at the given index.
  #[wasm_bindgen(js_name = "renameLayer")]
  pub async fn rename_layer(&self, pattern_id: &str, layer_index: u32, name: String) -> Result<(), Error> {
    self.rename_layer_impl(pattern_id, layer_index, name).await
  }

  /// Updates layer visibility flags.
  #[wasm_bindgen(js_name = "updateLayerVisibility")]
  pub async fn update_layer_visibility(
    &self,
    pattern_id: &str,
    layer_index: u32,
    visibility_data: &[u8],
  ) -> Result<(), Error> {
    self
      .update_layer_visibility_impl(pattern_id, layer_index, visibility_data)
      .await
  }

  /// Moves a layer from `old_position` to `new_position`.
  #[wasm_bindgen(js_name = "moveLayer")]
  pub async fn move_layer(&self, pattern_id: &str, old_position: u32, new_position: u32) -> Result<(), Error> {
    self.move_layer_impl(pattern_id, old_position, new_position).await
  }

  /// Updates PDF export options.
  #[wasm_bindgen(js_name = "updatePdfExportOptions")]
  pub async fn update_pdf_export_options(&self, pattern_id: &str, options_data: &[u8]) -> Result<(), Error> {
    self.update_pdf_export_options_impl(pattern_id, options_data).await
  }

  /// Sets the reference image.
  #[wasm_bindgen(js_name = "setReferenceImage")]
  pub async fn set_reference_image(&self, pattern_id: &str, image_data: &[u8]) -> Result<(), Error> {
    self.set_reference_image_impl(pattern_id, image_data).await
  }

  /// Removes the reference image.
  #[wasm_bindgen(js_name = "removeReferenceImage")]
  pub async fn remove_reference_image(&self, pattern_id: &str) -> Result<(), Error> {
    self.remove_reference_image_impl(pattern_id).await
  }

  /// Updates reference image display settings.
  #[wasm_bindgen(js_name = "updateReferenceImageSettings")]
  pub async fn update_reference_image_settings(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    self
      .update_reference_image_settings_impl(pattern_id, settings_data)
      .await
  }

  /// Undoes the last edit or transaction in the pattern with the given ID.
  pub async fn undo(&self, pattern_id: &str, single: bool) -> Result<(), Error> {
    self.undo_impl(pattern_id, single).await
  }

  /// Redoes the last undone edit or transaction in the pattern with the given ID.
  pub async fn redo(&self, pattern_id: &str, single: bool) -> Result<(), Error> {
    self.redo_impl(pattern_id, single).await
  }

  /// Starts a new transaction in the pattern with the given ID.
  #[wasm_bindgen(js_name = "startTransaction")]
  pub async fn start_transaction(&self, pattern_id: &str) -> Result<(), Error> {
    self.start_transaction_impl(pattern_id).await
  }

  /// Ends the current transaction in the pattern with the given ID.
  #[wasm_bindgen(js_name = "endTransaction")]
  pub async fn end_transaction(&self, pattern_id: &str) -> Result<(), Error> {
    self.end_transaction_impl(pattern_id).await
  }

  /// Checks if the pattern with the given ID has unsaved changes.
  #[wasm_bindgen(js_name = "hasUnsavedChanges")]
  pub fn has_unsaved_changes(&self, pattern_id: &str) -> Result<bool, Error> {
    self.has_unsaved_changes_impl(pattern_id)
  }
}

// Private helpers and instrumented implementations.
// Must not be exposed via `#[wasm_bindgen]`.
impl EditorWrapper {
  /// Provides exclusive mutable access to the global `EDITOR`.
  #[allow(clippy::unused_self)]
  fn run<F, T>(&self, f: F) -> T
  where
    F: FnOnce(&mut Editor) -> T,
  {
    EDITOR.with(|cell| f(cell.borrow_mut().as_mut().unwrap()))
  }

  /// Dispatches an action against the editor, journals it, and emits the resulting events.
  ///
  /// If the journal write fails, the action is rolled back so both states remain identical.
  /// Events are only emitted after a successful journal write.
  async fn dispatch(&self, pattern_id: uuid::Uuid, action: EditorAction) -> Result<(), Error> {
    let events = self.run(|editor| editor.dispatch(&pattern_id, action.clone()))?;
    if !events.is_empty() {
      let action_bytes = borsh::to_vec(&JournalEntry::Action(action))?;
      if let Err(e) = self.persistence.append_journal_entry(pattern_id, action_bytes).await {
        if let Err(undo_err) = self.run(|editor| editor.undo(&pattern_id)) {
          tracing::error!("Failed to roll back action after journal failure: {undo_err}");
        }
        return Err(e);
      }
    }
    emit_events(&self.callback, events)
  }

  #[tracing::instrument(name = "EditorWrapper::set_auto_save_interval", level = "debug", skip(self))]
  fn set_auto_save_interval_impl(&self, millis: u32) {
    *self.auto_save_interval.borrow_mut() = if millis == 0 {
      None
    } else {
      let persistence = self.persistence.clone();
      let callback = self.callback.clone();
      Some(timers::Interval::new(millis, move || {
        let persistence = persistence.clone();
        let callback = callback.clone();
        wasm_bindgen_futures::spawn_local(async move {
          auto_save_tick(persistence, callback).await;
        });
      }))
    };
  }

  #[tracing::instrument(
    name = "EditorWrapper::open_pattern",
    level = "debug",
    skip_all,
    fields(file_name),
    ret,
    err
  )]
  async fn open_pattern_impl(&self, file_handle: opfs::FileHandle) -> Result<(String, String), Error> {
    let file_name = file_handle.name();
    let data = file_handle.read().await?;

    tracing::Span::current().record("file_name", &file_name);

    let patproj = embroiderly_parsers::parse_pattern(&data, &file_name)?;
    let title = patproj.pattern.info.title.clone();
    let title = if title.is_empty() { file_name } else { title };

    // Serialize the initial pattern state before handing ownership to the editor.
    // This snapshot serves as the replay baseline for session restore.
    let snapshot = borsh::to_vec(&patproj)?;
    let pattern_id = self.run(|editor| editor.add_pattern(patproj));

    self
      .persistence
      .save_pattern_entry(pattern_id, snapshot, Some(file_handle))
      .await?;

    Ok((pattern_id.to_string(), title))
  }

  #[tracing::instrument(
    name = "EditorWrapper::open_pattern_from_data",
    level = "debug",
    skip(self, data),
    ret,
    err
  )]
  async fn open_pattern_from_data_impl(&self, data: &[u8], file_name: &str) -> Result<(String, String), Error> {
    let patproj = embroiderly_parsers::parse_pattern(data, file_name)?;
    let title = patproj.pattern.info.title.clone();
    let title = if title.is_empty() { file_name.to_owned() } else { title };

    // Serialize the initial pattern state before handing ownership to the editor.
    // This snapshot serves as the replay baseline for session restore.
    let snapshot = borsh::to_vec(&patproj)?;
    let pattern_id = self.run(|editor| editor.add_pattern(patproj));

    self.persistence.save_pattern_entry(pattern_id, snapshot, None).await?;

    Ok((pattern_id.to_string(), title))
  }

  #[tracing::instrument(name = "EditorWrapper::create_pattern", level = "debug", skip_all, ret, err)]
  async fn create_pattern_impl(&self, fabric_data: &[u8]) -> Result<(String, String), Error> {
    let fabric = borsh::from_slice(fabric_data)?;

    let patproj = PatternProject::builder(Pattern::new(fabric)).build();
    let title = patproj.pattern.info.title.clone();

    // Serialize the initial pattern state before handing ownership to the editor.
    // This snapshot serves as the replay baseline for session restore.
    let snapshot = borsh::to_vec(&patproj)?;
    let pattern_id = self.run(|editor| editor.add_pattern(patproj));

    self.persistence.save_pattern_entry(pattern_id, snapshot, None).await?;

    Ok((pattern_id.to_string(), title))
  }

  #[tracing::instrument(name = "EditorWrapper::load_pattern", level = "debug", skip(self), err)]
  async fn load_pattern_impl(&self, pattern_id: &str) -> Result<Vec<u8>, Error> {
    let id = uuid::Uuid::parse_str(pattern_id)?;

    if let Some(data) = self.run(|editor| editor.get_pattern(&id).map(borsh::to_vec)) {
      return Ok(data?);
    }

    self.restore_pattern(pattern_id).await?;
    self.run(|editor| {
      if let Some(patproj) = editor.get_pattern(&id) {
        Ok(borsh::to_vec(patproj)?)
      } else {
        Err(Error::new(ErrorKind::PatternNotFound))
      }
    })
  }

  async fn restore_pattern(&self, pattern_id: &str) -> Result<(), Error> {
    let id = uuid::Uuid::parse_str(pattern_id)?;

    let entry = self
      .persistence
      .get_pattern_entry(id)
      .await?
      .ok_or_else(|| Error::new(ErrorKind::PatternNotFound))?;

    let patproj: PatternProject = borsh::from_slice(&entry.data)?;
    self.run(|editor| {
      editor.add_pattern(patproj);
      editor.checkpoint(&id)
    })?;

    let actions = self.persistence.load_journal_entries(id).await?;
    for action_bytes in actions {
      let op: JournalEntry = borsh::from_slice(&action_bytes)?;
      match op {
        JournalEntry::Action(action) => {
          if let Err(e) = self.run(|editor| editor.dispatch(&id, action)) {
            tracing::warn!("Failed to replay journal action: {e}");
          }
        }
        JournalEntry::Undo => {
          if let Err(e) = self.run(|editor| editor.undo(&id)) {
            tracing::warn!("Failed to replay journal undo: {e}");
          }
        }
        JournalEntry::Redo => {
          if let Err(e) = self.run(|editor| editor.redo(&id)) {
            tracing::warn!("Failed to replay journal redo: {e}");
          }
        }
        JournalEntry::UndoTransaction => {
          if let Err(e) = self.run(|editor| editor.undo_transaction(&id)) {
            tracing::warn!("Failed to replay journal undo_transaction: {e}");
          }
        }
        JournalEntry::RedoTransaction => {
          if let Err(e) = self.run(|editor| editor.redo_transaction(&id)) {
            tracing::warn!("Failed to replay journal redo_transaction: {e}");
          }
        }
        JournalEntry::StartTransaction => {
          if let Err(e) = self.run(|editor| editor.start_transaction(&id)) {
            tracing::warn!("Failed to replay journal start_transaction: {e}");
          }
        }
        JournalEntry::EndTransaction => {
          if let Err(e) = self.run(|editor| editor.end_transaction(&id)) {
            tracing::warn!("Failed to replay journal end_transaction: {e}");
          }
        }
        JournalEntry::Checkpoint => {
          if let Err(e) = self.run(|editor| editor.checkpoint(&id)) {
            tracing::warn!("Failed to replay journal checkpoint: {e}");
          }
        }
      }
    }

    // Emit the correct dirty event so the frontend tab reflects accurate state after lazy restore.
    let dirty = self.run(|editor| editor.has_unsaved_changes(&id))?;
    emit_events(
      &self.callback,
      [if dirty {
        EditorEvent::PatternChanged(id)
      } else {
        EditorEvent::PatternCheckpoint(id)
      }],
    )?;

    Ok(())
  }

  #[tracing::instrument(
    name = "EditorWrapper::save_pattern",
    level = "debug",
    skip(self, file_handle),
    fields(file_name),
    err
  )]
  async fn save_pattern_impl(&self, pattern_id: &str, file_handle: Option<opfs::FileHandle>) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let file_handle = if let Some(file_handle) = file_handle {
      self.persistence.update_handle(pattern_id, file_handle.clone()).await?;
      file_handle
    } else {
      self
        .persistence
        .get_handle(pattern_id)
        .await?
        .ok_or_else(|| Error::new(ErrorKind::NoFileHandle))?
    };

    let file_name = file_handle.name();
    let format = PatternFormat::try_from(file_name.as_str())?;

    tracing::Span::current().record("file_name", &file_name);

    let data = self.run(|editor| {
      if let Some(patproj) = editor.get_pattern(&pattern_id) {
        Ok(embroiderly_parsers::save_pattern(patproj, format, &package_info())?)
      } else {
        Err(Error::new(ErrorKind::PatternNotFound))
      }
    })?;

    file_handle.write(&data).await?;
    self.run(|editor| editor.checkpoint(&pattern_id))?;

    // Record the checkpoint in the journal so that `has_unsaved_changes` is correctly restored when the history is replayed after a page reload.
    let action_bytes = borsh::to_vec(&JournalEntry::Checkpoint)?;
    if let Err(e) = self.persistence.append_journal_entry(pattern_id, action_bytes).await {
      tracing::warn!("Failed to journal checkpoint after save: {e}");
    }

    emit_events(
      &self.callback,
      [
        EditorEvent::PatternCheckpoint(pattern_id),
        EditorEvent::PatternSaved(pattern_id),
      ],
    )?;

    Ok(())
  }

  #[tracing::instrument(
    name = "EditorWrapper::export_pattern",
    level = "debug",
    skip(self, file_handle),
    fields(file_name),
    err
  )]
  async fn export_pattern_impl(&self, pattern_id: &str, file_handle: opfs::FileHandle) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let file_name = file_handle.name();

    tracing::Span::current().record("file_name", &file_name);

    let format = PatternFormat::try_from(file_name.as_str())?;
    let data = self.run(|editor| {
      if let Some(patproj) = editor.get_pattern(&pattern_id) {
        Ok(embroiderly_parsers::save_pattern(patproj, format, &package_info())?)
      } else {
        Err(Error::new(ErrorKind::PatternNotFound))
      }
    })?;

    file_handle.write(&data).await?;

    Ok(())
  }

  #[tracing::instrument(name = "EditorWrapper::close_pattern", level = "debug", skip(self), err)]
  async fn close_pattern_impl(&self, pattern_id: &str, force: bool) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self.run(|editor| {
      if !force {
        let has_changes = editor.has_unsaved_changes(&pattern_id)?;
        if has_changes {
          return Err(Error::new(ErrorKind::UnsavedChanges));
        }
      }
      editor.remove_pattern(&pattern_id);
      Ok(())
    })?;
    self.persistence.remove_pattern_entry(pattern_id).await?;
    self.persistence.clear_journal(pattern_id).await
  }

  #[tracing::instrument(name = "EditorWrapper::add_stitch", level = "debug", skip(self, stitch_data), err)]
  async fn add_stitch_impl(&self, pattern_id: &str, layer_index: u32, stitch_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let stitch: Stitch = borsh::from_slice(stitch_data)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Stitch(StitchAction::Add {
          layer_index,
          stitch,
          conflicts: None,
        }),
      )
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::remove_stitch", level = "debug", skip(self, stitch_data), err)]
  async fn remove_stitch_impl(&self, pattern_id: &str, layer_index: u32, stitch_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let stitch: Stitch = borsh::from_slice(stitch_data)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Stitch(StitchAction::Remove {
          layer_index,
          target_stitch: stitch,
          actual_stitch: None,
        }),
      )
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::update_fabric", level = "debug", skip(self, fabric_data), err)]
  async fn update_fabric_impl(&self, pattern_id: &str, fabric_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let fabric = borsh::from_slice(fabric_data)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Fabric(FabricAction::Update {
          fabric,
          old_fabric: None,
          extra_stitches: None,
        }),
      )
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::update_grid", level = "debug", skip(self, grid_data), err)]
  async fn update_grid_impl(&self, pattern_id: &str, grid_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let grid = borsh::from_slice(grid_data)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Grid(GridAction::Update { grid, old_grid: None }),
      )
      .await
  }

  #[tracing::instrument(
    name = "EditorWrapper::add_palette_item",
    level = "debug",
    skip(self, palitem_data),
    err
  )]
  async fn add_palette_item_impl(&self, pattern_id: &str, palitem_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let palitem = borsh::from_slice(palitem_data)?;
    self
      .dispatch(pattern_id, EditorAction::Palette(PaletteAction::AddItem { palitem }))
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::remove_palette_items", level = "debug", skip(self), err)]
  async fn remove_palette_items_impl(&self, pattern_id: &str, palindexes: Vec<u32>) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Palette(PaletteAction::RemoveItems {
          palindexes,
          saved_palitems: None,
          saved_conflicts: None,
        }),
      )
      .await
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_palette_display_settings",
    level = "debug",
    skip(self, settings_data),
    err
  )]
  async fn update_palette_display_settings_impl(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let settings = borsh::from_slice(settings_data)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Palette(PaletteAction::UpdateDisplaySettings {
          settings,
          old_settings: None,
        }),
      )
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::sort_palette", level = "debug", skip(self), err)]
  async fn sort_palette_impl(&self, pattern_id: &str, sort_by: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let sort_by = match sort_by {
      "BrandAndNumber" => SortPaletteBy::BrandAndNumber,
      _ => {
        return Err(
          Error::new(ErrorKind::Unexpected).with_source(anyhow::anyhow!("Unknown SortPaletteBy variant: {sort_by}")),
        );
      }
    };
    self
      .dispatch(
        pattern_id,
        EditorAction::Palette(PaletteAction::Sort {
          sort_by,
          old_positions: None,
        }),
      )
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::reorder_palette_items", level = "debug", skip(self), err)]
  async fn reorder_palette_items_impl(
    &self,
    pattern_id: &str,
    old_position: u32,
    new_position: u32,
  ) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Palette(PaletteAction::Reorder {
          old_position,
          new_position,
          old_positions: None,
        }),
      )
      .await
  }

  #[tracing::instrument(
    name = "EditorWrapper::set_palette_item_symbol",
    level = "debug",
    skip(self, symbol_data),
    err
  )]
  async fn set_palette_item_symbol_impl(&self, pattern_id: &str, symbol_data: &[u8]) -> Result<(), Error> {
    #[derive(borsh::BorshDeserialize)]
    struct SetSymbolPayload {
      palindex: u32,
      symbol: Option<embroiderly_pattern::Symbol>,
    }
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let SetSymbolPayload { palindex, symbol } = borsh::from_slice(symbol_data)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Palette(PaletteAction::SetSymbol {
          palindex,
          symbol,
          old_symbol: None,
        }),
      )
      .await
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_pattern_info",
    level = "debug",
    skip(self, info_data),
    err
  )]
  async fn update_pattern_info_impl(&self, pattern_id: &str, info_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let info = borsh::from_slice(info_data)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Pattern(PatternAction::UpdateInfo { info, old_info: None }),
      )
      .await
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_display_settings",
    level = "debug",
    skip(self, settings_data),
    err
  )]
  async fn update_display_settings_impl(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let display_settings = borsh::from_slice(settings_data)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Display(DisplayAction::Update {
          display_settings,
          old_display_settings: None,
        }),
      )
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::add_layer", level = "debug", skip(self), err)]
  async fn add_layer_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self
      .dispatch(pattern_id, EditorAction::Layer(LayerAction::Add { added_index: None }))
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::remove_layer", level = "debug", skip(self), err)]
  async fn remove_layer_impl(&self, pattern_id: &str, layer_index: u32) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Layer(LayerAction::Remove {
          layer_index,
          removed_layer: None,
        }),
      )
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::rename_layer", level = "debug", skip(self), err)]
  async fn rename_layer_impl(&self, pattern_id: &str, layer_index: u32, name: String) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Layer(LayerAction::Rename {
          layer_index,
          name,
          old_name: None,
        }),
      )
      .await
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_layer_visibility",
    level = "debug",
    skip(self, visibility_data),
    err
  )]
  async fn update_layer_visibility_impl(
    &self,
    pattern_id: &str,
    layer_index: u32,
    visibility_data: &[u8],
  ) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let visibility: LayerVisibility = borsh::from_slice(visibility_data)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Layer(LayerAction::UpdateVisibility {
          layer_index,
          visibility,
          old_visibility: None,
        }),
      )
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::move_layer", level = "debug", skip(self), err)]
  async fn move_layer_impl(&self, pattern_id: &str, old_position: u32, new_position: u32) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Layer(LayerAction::Move {
          old_position,
          new_position,
          old_positions: None,
        }),
      )
      .await
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_pdf_export_options",
    level = "debug",
    skip(self, options_data),
    err
  )]
  async fn update_pdf_export_options_impl(&self, pattern_id: &str, options_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let options = borsh::from_slice(options_data)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Publish(PublishAction::UpdatePdfExportOptions {
          options,
          old_options: None,
        }),
      )
      .await
  }

  #[tracing::instrument(
    name = "EditorWrapper::set_reference_image",
    level = "debug",
    skip(self, image_data),
    err
  )]
  async fn set_reference_image_impl(&self, pattern_id: &str, image_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let image = ReferenceImage::new(image_data.to_vec(), None);
    self
      .dispatch(
        pattern_id,
        EditorAction::Image(ImageAction::SetReferenceImage {
          image: Some(image),
          old_image: None,
        }),
      )
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::remove_reference_image", level = "debug", skip(self), err)]
  async fn remove_reference_image_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Image(ImageAction::SetReferenceImage {
          image: None,
          old_image: None,
        }),
      )
      .await
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_reference_image_settings",
    level = "debug",
    skip(self, settings_data),
    err
  )]
  async fn update_reference_image_settings_impl(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let settings = borsh::from_slice(settings_data)?;
    self
      .dispatch(
        pattern_id,
        EditorAction::Image(ImageAction::UpdateSettings {
          settings,
          old_settings: None,
        }),
      )
      .await
  }

  #[tracing::instrument(name = "EditorWrapper::undo", level = "debug", skip(self), err)]
  async fn undo_impl(&self, pattern_id: &str, single: bool) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;

    let (mut events, journal_entry) = if single {
      let events = self.run(|editor| editor.undo(&pattern_id))?;
      (events, JournalEntry::Undo)
    } else {
      let events = self.run(|editor| editor.undo_transaction(&pattern_id))?;
      (events, JournalEntry::UndoTransaction)
    };

    if !events.is_empty() {
      let action_bytes = borsh::to_vec(&journal_entry)?;
      if let Err(e) = self.persistence.append_journal_entry(pattern_id, action_bytes).await {
        if single {
          if let Err(redo_err) = self.run(|editor| editor.redo(&pattern_id)) {
            tracing::error!("Failed to roll back undo after journal failure: {redo_err}");
          }
        } else if let Err(redo_err) = self.run(|editor| editor.redo_transaction(&pattern_id)) {
          tracing::error!("Failed to roll back undo after journal failure: {redo_err}");
        }
        return Err(e);
      }
    }

    if !self.run(|editor| editor.has_unsaved_changes(&pattern_id))? {
      events.push(EditorEvent::PatternCheckpoint(pattern_id));
    }

    emit_events(&self.callback, events)
  }

  #[tracing::instrument(name = "EditorWrapper::redo", level = "debug", skip(self), err)]
  async fn redo_impl(&self, pattern_id: &str, single: bool) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;

    let (mut events, journal_entry) = if single {
      let events = self.run(|editor| editor.redo(&pattern_id))?;
      (events, JournalEntry::Redo)
    } else {
      let events = self.run(|editor| editor.redo_transaction(&pattern_id))?;
      (events, JournalEntry::RedoTransaction)
    };

    if !events.is_empty() {
      let action_bytes = borsh::to_vec(&journal_entry)?;
      if let Err(e) = self.persistence.append_journal_entry(pattern_id, action_bytes).await {
        if single {
          if let Err(undo_err) = self.run(|editor| editor.undo(&pattern_id)) {
            tracing::error!("Failed to roll back redo after journal failure: {undo_err}");
          }
        } else if let Err(undo_err) = self.run(|editor| editor.undo_transaction(&pattern_id)) {
          tracing::error!("Failed to roll back redo after journal failure: {undo_err}");
        }
        return Err(e);
      }
    }

    if !self.run(|editor| editor.has_unsaved_changes(&pattern_id))? {
      events.push(EditorEvent::PatternCheckpoint(pattern_id));
    }

    emit_events(&self.callback, events)
  }

  #[tracing::instrument(name = "EditorWrapper::start_transaction", level = "debug", skip(self), err)]
  async fn start_transaction_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self.run(|editor| editor.start_transaction(&pattern_id))?;
    let action_bytes = borsh::to_vec(&JournalEntry::StartTransaction)?;
    if let Err(e) = self.persistence.append_journal_entry(pattern_id, action_bytes).await {
      if let Err(end_err) = self.run(|editor| editor.end_transaction(&pattern_id)) {
        tracing::error!("Failed to roll back start_transaction after journal failure: {end_err}");
      }
      return Err(e);
    }
    Ok(())
  }

  #[tracing::instrument(name = "EditorWrapper::end_transaction", level = "debug", skip(self), err)]
  async fn end_transaction_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self.run(|editor| editor.end_transaction(&pattern_id))?;
    let action_bytes = borsh::to_vec(&JournalEntry::EndTransaction)?;
    if let Err(e) = self.persistence.append_journal_entry(pattern_id, action_bytes).await {
      if let Err(undo_err) = self.run(|editor| editor.undo_transaction(&pattern_id)) {
        tracing::error!("Failed to roll back end_transaction after journal failure: {undo_err}");
      }
      return Err(e);
    }
    Ok(())
  }

  #[tracing::instrument(name = "EditorWrapper::has_unsaved_changes", level = "debug", skip(self), ret, err)]
  fn has_unsaved_changes_impl(&self, pattern_id: &str) -> Result<bool, Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    Ok(self.run(|editor| editor.has_unsaved_changes(&pattern_id))?)
  }
}

fn package_info() -> PackageInfo {
  PackageInfo {
    name: "Embroiderly".to_owned(),
    version: "0.7.1".to_owned(),
  }
}

fn emit_events(callback: &js_sys::Function, events: impl IntoIterator<Item = EditorEvent>) -> Result<(), Error> {
  for event in events {
    let payload = borsh::to_vec(&event)?;
    let payload = Uint8Array::from(payload.as_slice());
    callback.call1(&JsValue::null(), &payload)?;
  }
  Ok(())
}

#[tracing::instrument(name = "auto_save_tick", level = "debug", skip_all)]
async fn auto_save_tick(persistence: Rc<PersistenceManager>, callback: js_sys::Function) {
  let pattern_ids = EDITOR.with(|cell| {
    cell
      .borrow()
      .as_ref()
      .map(embroiderly_editor::Editor::pattern_ids)
      .unwrap_or_default()
  });
  if pattern_ids.is_empty() {
    tracing::debug!("No patterns to save");
    return;
  }

  let pkg = package_info();

  tracing::debug!("Processing {} patterns", pattern_ids.len());
  for pattern_id in pattern_ids {
    let dirty = EDITOR.with(|cell| {
      cell
        .borrow()
        .as_ref()
        .and_then(|e| e.has_unsaved_changes(&pattern_id).ok())
        .unwrap_or(false)
    });
    if !dirty {
      tracing::debug!("Pattern {pattern_id} is clean, skipping");
      continue;
    }

    let file_handle = match persistence.get_handle(pattern_id).await {
      Ok(Some(h)) => h,
      Ok(None) => {
        tracing::debug!("No file handle for {pattern_id}, skipping");
        continue;
      }
      Err(e) => {
        tracing::warn!("Failed to get file handle for {pattern_id}: {e}");
        continue;
      }
    };

    let file_name = file_handle.name();
    let format = match PatternFormat::try_from(file_name.as_str()) {
      Ok(f) => f,
      Err(e) => {
        tracing::warn!("Unknown format for {pattern_id}: {e}");
        continue;
      }
    };

    let data = EDITOR.with(|cell| {
      cell
        .borrow()
        .as_ref()
        .and_then(|e| e.get_pattern(&pattern_id))
        .and_then(|p| embroiderly_parsers::save_pattern(p, format, &pkg).ok())
    });
    let Some(data) = data else {
      tracing::warn!("Failed to encode {pattern_id}");
      continue;
    };

    if let Err(e) = file_handle.write(&data).await {
      tracing::warn!("Failed to write {pattern_id}: {e}");
      continue;
    }

    EDITOR.with(|cell| {
      if let Some(editor) = cell.borrow_mut().as_mut()
        && let Err(e) = editor.checkpoint(&pattern_id)
      {
        tracing::warn!("Checkpoint failed for {pattern_id}: {e}");
      }
    });

    if let Ok(action_bytes) = borsh::to_vec(&JournalEntry::Checkpoint)
      && let Err(e) = persistence.append_journal_entry(pattern_id, action_bytes).await
    {
      tracing::warn!("Failed to journal checkpoint for {pattern_id}: {e}");
    }

    let _ = emit_events(
      &callback,
      [
        EditorEvent::PatternCheckpoint(pattern_id),
        EditorEvent::PatternSaved(pattern_id),
      ],
    );
  }
}
