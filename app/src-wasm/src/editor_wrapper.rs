use std::cell::RefCell;

use embroiderly_editor::actions::layers::LayerVisibility;
use embroiderly_editor::actions::palette::SortPaletteBy;
use embroiderly_editor::actions::{
  DisplayAction, FabricAction, GridAction, ImageAction, LayerAction, PaletteAction, PatternAction, PublishAction,
  StitchAction,
};
use embroiderly_editor::{Editor, EditorAction, EditorEvent};
use embroiderly_parsers::{PackageInfo, PatternFormat};
use embroiderly_pattern::{Pattern, PatternProject, ReferenceImage, Stitch};
use js_sys::{Function, Uint8Array};
use wasm_bindgen::prelude::*;

use crate::error::{Error, ErrorKind};
use crate::persistence_manager::PersistenceManager;
use crate::web::opfs;

thread_local! {
  pub(crate) static EDITOR: RefCell<Option<Editor>> = const { RefCell::new(None) };
}

#[wasm_bindgen(getter_with_clone)]
pub struct OpenPatternResult {
  pub id: String,
  pub title: String,
}

fn package_info() -> PackageInfo {
  PackageInfo {
    name: "Embroiderly".to_owned(),
    version: "0.7.1".to_owned(),
  }
}

#[wasm_bindgen]
pub struct EditorWrapper {
  callback: Function,
  persistence: PersistenceManager,
}

// Public methods which delegate the execution to private instrumented implementations.
#[wasm_bindgen]
impl EditorWrapper {
  /// Creates a new `EditorWrapper`.
  pub async fn create(callback: Function) -> Result<Self, Error> {
    EDITOR.with(|cell| {
      *cell.borrow_mut() = Some(Editor::new());
    });
    Ok(Self {
      callback,
      persistence: PersistenceManager::create().await?,
    })
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
  pub fn open_pattern_from_data(&self, data: &[u8], file_name: &str) -> Result<OpenPatternResult, Error> {
    let (id, title) = self.open_pattern_from_data_impl(data, file_name)?;
    Ok(OpenPatternResult { id, title })
  }

  /// Creates a blank pattern from the provided Borsh-serialized `Fabric` data.
  /// Returns its UUID as a string.
  #[wasm_bindgen(js_name = "createPattern")]
  pub fn create_pattern(&self, fabric_data: &[u8]) -> Result<String, Error> {
    self.create_pattern_impl(fabric_data)
  }

  /// Returns the Borsh-serialized `PatternProject`.
  #[wasm_bindgen(js_name = "loadPattern")]
  pub fn load_pattern(&self, pattern_id: &str) -> Result<Vec<u8>, Error> {
    self.load_pattern_impl(pattern_id)
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

  /// Removes the pattern from the editor and cleans up its persisted handle from IndexedDB.
  /// Throws an error if the pattern has unsaved changes and `force` is false.
  #[wasm_bindgen(js_name = "closePattern")]
  pub async fn close_pattern(&self, pattern_id: &str, force: bool) -> Result<(), Error> {
    self.close_pattern_impl(pattern_id, force).await
  }

  /// Adds a stitch to the pattern layer.
  #[wasm_bindgen(js_name = "addStitch")]
  pub fn add_stitch(&self, pattern_id: &str, layer_index: u32, stitch_data: &[u8]) -> Result<(), Error> {
    self.add_stitch_impl(pattern_id, layer_index, stitch_data)
  }

  /// Removes a stitch from the pattern layer.
  #[wasm_bindgen(js_name = "removeStitch")]
  pub fn remove_stitch(&self, pattern_id: &str, layer_index: u32, stitch_data: &[u8]) -> Result<(), Error> {
    self.remove_stitch_impl(pattern_id, layer_index, stitch_data)
  }

  /// Updates fabric properties.
  #[wasm_bindgen(js_name = "updateFabric")]
  pub fn update_fabric(&self, pattern_id: &str, fabric_data: &[u8]) -> Result<(), Error> {
    self.update_fabric_impl(pattern_id, fabric_data)
  }

  /// Updates grid properties.
  #[wasm_bindgen(js_name = "updateGrid")]
  pub fn update_grid(&self, pattern_id: &str, grid_data: &[u8]) -> Result<(), Error> {
    self.update_grid_impl(pattern_id, grid_data)
  }

  /// Adds a new palette item.
  #[wasm_bindgen(js_name = "addPaletteItem")]
  pub fn add_palette_item(&self, pattern_id: &str, palitem_data: &[u8]) -> Result<(), Error> {
    self.add_palette_item_impl(pattern_id, palitem_data)
  }

  /// Removes palette items by their indexes.
  #[wasm_bindgen(js_name = "removePaletteItems")]
  pub fn remove_palette_items(&self, pattern_id: &str, palindexes: Vec<u32>) -> Result<(), Error> {
    self.remove_palette_items_impl(pattern_id, palindexes)
  }

  /// Updates palette display settings.
  #[wasm_bindgen(js_name = "updatePaletteDisplaySettings")]
  pub fn update_palette_display_settings(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    self.update_palette_display_settings_impl(pattern_id, settings_data)
  }

  /// Sorts palette items by the given criterion.
  #[wasm_bindgen(js_name = "sortPalette")]
  pub fn sort_palette(&self, pattern_id: &str, sort_by: &str) -> Result<(), Error> {
    self.sort_palette_impl(pattern_id, sort_by)
  }

  /// Reorders a palette item from `old_position` to `new_position`.
  #[wasm_bindgen(js_name = "reorderPaletteItems")]
  pub fn reorder_palette_items(&self, pattern_id: &str, old_position: u32, new_position: u32) -> Result<(), Error> {
    self.reorder_palette_items_impl(pattern_id, old_position, new_position)
  }

  /// Sets the stitch symbol for a palette item.
  #[wasm_bindgen(js_name = "setPaletteItemSymbol")]
  pub fn set_palette_item_symbol(&self, pattern_id: &str, symbol_data: &[u8]) -> Result<(), Error> {
    self.set_palette_item_symbol_impl(pattern_id, symbol_data)
  }

  /// Updates pattern info.
  #[wasm_bindgen(js_name = "updatePatternInfo")]
  pub fn update_pattern_info(&self, pattern_id: &str, info_data: &[u8]) -> Result<(), Error> {
    self.update_pattern_info_impl(pattern_id, info_data)
  }

  /// Updates display settings.
  #[wasm_bindgen(js_name = "updateDisplaySettings")]
  pub fn update_display_settings(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    self.update_display_settings_impl(pattern_id, settings_data)
  }

  /// Adds a new layer to the pattern.
  #[wasm_bindgen(js_name = "addLayer")]
  pub fn add_layer(&self, pattern_id: &str) -> Result<(), Error> {
    self.add_layer_impl(pattern_id)
  }

  /// Removes the layer at the given index.
  #[wasm_bindgen(js_name = "removeLayer")]
  pub fn remove_layer(&self, pattern_id: &str, layer_index: u32) -> Result<(), Error> {
    self.remove_layer_impl(pattern_id, layer_index)
  }

  /// Renames the layer at the given index.
  #[wasm_bindgen(js_name = "renameLayer")]
  pub fn rename_layer(&self, pattern_id: &str, layer_index: u32, name: String) -> Result<(), Error> {
    self.rename_layer_impl(pattern_id, layer_index, name)
  }

  /// Updates layer visibility flags.
  #[wasm_bindgen(js_name = "updateLayerVisibility")]
  pub fn update_layer_visibility(
    &self,
    pattern_id: &str,
    layer_index: u32,
    visibility_data: &[u8],
  ) -> Result<(), Error> {
    self.update_layer_visibility_impl(pattern_id, layer_index, visibility_data)
  }

  /// Moves a layer from `old_position` to `new_position`.
  #[wasm_bindgen(js_name = "moveLayer")]
  pub fn move_layer(&self, pattern_id: &str, old_position: u32, new_position: u32) -> Result<(), Error> {
    self.move_layer_impl(pattern_id, old_position, new_position)
  }

  /// Updates PDF export options.
  #[wasm_bindgen(js_name = "updatePdfExportOptions")]
  pub fn update_pdf_export_options(&self, pattern_id: &str, options_data: &[u8]) -> Result<(), Error> {
    self.update_pdf_export_options_impl(pattern_id, options_data)
  }

  /// Sets the reference image.
  #[wasm_bindgen(js_name = "setReferenceImage")]
  pub fn set_reference_image(&self, pattern_id: &str, image_data: &[u8]) -> Result<(), Error> {
    self.set_reference_image_impl(pattern_id, image_data)
  }

  /// Removes the reference image.
  #[wasm_bindgen(js_name = "removeReferenceImage")]
  pub fn remove_reference_image(&self, pattern_id: &str) -> Result<(), Error> {
    self.remove_reference_image_impl(pattern_id)
  }

  /// Updates reference image display settings.
  #[wasm_bindgen(js_name = "updateReferenceImageSettings")]
  pub fn update_reference_image_settings(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    self.update_reference_image_settings_impl(pattern_id, settings_data)
  }

  /// Undoes the last edit in the pattern with the given ID.
  pub fn undo(&self, pattern_id: &str) -> Result<(), Error> {
    self.undo_impl(pattern_id)
  }

  /// Redoes the last undone edit in the pattern with the given ID.
  pub fn redo(&self, pattern_id: &str) -> Result<(), Error> {
    self.redo_impl(pattern_id)
  }

  /// Undoes the last transaction in the pattern with the given ID.
  #[wasm_bindgen(js_name = "undoTransaction")]
  pub fn undo_transaction(&self, pattern_id: &str) -> Result<(), Error> {
    self.undo_transaction_impl(pattern_id)
  }

  /// Redoes the last undone transaction in the pattern with the given ID.
  #[wasm_bindgen(js_name = "redoTransaction")]
  pub fn redo_transaction(&self, pattern_id: &str) -> Result<(), Error> {
    self.redo_transaction_impl(pattern_id)
  }

  /// Starts a new transaction in the pattern with the given ID.
  #[wasm_bindgen(js_name = "startTransaction")]
  pub fn start_transaction(&self, pattern_id: &str) -> Result<(), Error> {
    self.start_transaction_impl(pattern_id)
  }

  /// Ends the current transaction in the pattern with the given ID.
  #[wasm_bindgen(js_name = "endTransaction")]
  pub fn end_transaction(&self, pattern_id: &str) -> Result<(), Error> {
    self.end_transaction_impl(pattern_id)
  }

  /// Records a checkpoint (save point) for the pattern. Used for tracking unsaved changes.
  pub fn checkpoint(&self, pattern_id: &str) -> Result<(), Error> {
    self.checkpoint_impl(pattern_id)
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

  /// Sends the given events to the frontend.
  fn send_events(&self, events: Vec<EditorEvent>) -> Result<(), Error> {
    for event in events {
      let payload = borsh::to_vec(&event)?;
      let payload = Uint8Array::from(payload.as_slice());
      self.callback.call1(&JsValue::null(), &payload)?;
    }
    Ok(())
  }

  /// Dispatches an action and sends the resulting events.
  fn dispatch(&self, pattern_id: uuid::Uuid, action: EditorAction) -> Result<(), Error> {
    let events = self.run(|editor| editor.dispatch(&pattern_id, action))?;
    self.send_events(events)
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
    let pattern_id = self.run(|editor| editor.add_pattern(patproj));

    self.persistence.save_handle(pattern_id, file_handle).await?;

    Ok((pattern_id.to_string(), title))
  }

  #[tracing::instrument(
    name = "EditorWrapper::open_pattern_from_data",
    level = "debug",
    skip(self, data),
    ret,
    err
  )]
  fn open_pattern_from_data_impl(&self, data: &[u8], file_name: &str) -> Result<(String, String), Error> {
    let patproj = embroiderly_parsers::parse_pattern(data, file_name)?;
    let title = patproj.pattern.info.title.clone();
    let title = if title.is_empty() { file_name.to_owned() } else { title };
    let pattern_id = self.run(|editor| editor.add_pattern(patproj));
    Ok((pattern_id.to_string(), title))
  }

  #[tracing::instrument(name = "EditorWrapper::create_pattern", level = "debug", skip_all, ret, err)]
  fn create_pattern_impl(&self, fabric_data: &[u8]) -> Result<String, Error> {
    let fabric = borsh::from_slice(fabric_data)?;
    let pattern = Pattern::new(fabric);
    let patproj = PatternProject::builder(pattern).build();
    let pattern_id = self.run(|editor| editor.add_pattern(patproj));
    Ok(pattern_id.to_string())
  }

  #[tracing::instrument(name = "EditorWrapper::load_pattern", level = "debug", skip(self), err)]
  fn load_pattern_impl(&self, pattern_id: &str) -> Result<Vec<u8>, Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self.run(|editor| {
      if let Some(patproj) = editor.get_pattern(&pattern_id) {
        Ok(borsh::to_vec(patproj)?)
      } else {
        Err(Error::new(ErrorKind::PatternNotFound))
      }
    })
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
      self.persistence.save_handle(pattern_id, file_handle.clone()).await?;
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
    self.persistence.remove_handle(pattern_id).await
  }

  #[tracing::instrument(name = "EditorWrapper::add_stitch", level = "debug", skip(self, stitch_data), err)]
  fn add_stitch_impl(&self, pattern_id: &str, layer_index: u32, stitch_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let stitch: Stitch = borsh::from_slice(stitch_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Stitch(StitchAction::Add {
        layer_index,
        stitch,
        conflicts: None,
      }),
    )
  }

  #[tracing::instrument(name = "EditorWrapper::remove_stitch", level = "debug", skip(self, stitch_data), err)]
  fn remove_stitch_impl(&self, pattern_id: &str, layer_index: u32, stitch_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let stitch: Stitch = borsh::from_slice(stitch_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Stitch(StitchAction::Remove {
        layer_index,
        target_stitch: stitch,
        actual_stitch: None,
      }),
    )
  }

  #[tracing::instrument(name = "EditorWrapper::update_fabric", level = "debug", skip(self, fabric_data), err)]
  fn update_fabric_impl(&self, pattern_id: &str, fabric_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let fabric = borsh::from_slice(fabric_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Fabric(FabricAction::Update {
        fabric,
        old_fabric: None,
        extra_stitches: None,
      }),
    )
  }

  #[tracing::instrument(name = "EditorWrapper::update_grid", level = "debug", skip(self, grid_data), err)]
  fn update_grid_impl(&self, pattern_id: &str, grid_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let grid = borsh::from_slice(grid_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Grid(GridAction::Update { grid, old_grid: None }),
    )
  }

  #[tracing::instrument(
    name = "EditorWrapper::add_palette_item",
    level = "debug",
    skip(self, palitem_data),
    err
  )]
  fn add_palette_item_impl(&self, pattern_id: &str, palitem_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let palitem = borsh::from_slice(palitem_data)?;
    self.dispatch(pattern_id, EditorAction::Palette(PaletteAction::AddItem { palitem }))
  }

  #[tracing::instrument(name = "EditorWrapper::remove_palette_items", level = "debug", skip(self), err)]
  fn remove_palette_items_impl(&self, pattern_id: &str, palindexes: Vec<u32>) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self.dispatch(
      pattern_id,
      EditorAction::Palette(PaletteAction::RemoveItems {
        palindexes,
        saved_palitems: None,
        saved_conflicts: None,
      }),
    )
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_palette_display_settings",
    level = "debug",
    skip(self, settings_data),
    err
  )]
  fn update_palette_display_settings_impl(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let settings = borsh::from_slice(settings_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Palette(PaletteAction::UpdateDisplaySettings {
        settings,
        old_settings: None,
      }),
    )
  }

  #[tracing::instrument(name = "EditorWrapper::sort_palette", level = "debug", skip(self), err)]
  fn sort_palette_impl(&self, pattern_id: &str, sort_by: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let sort_by = match sort_by {
      "BrandAndNumber" => SortPaletteBy::BrandAndNumber,
      _ => {
        return Err(
          Error::new(ErrorKind::Unexpected).with_source(anyhow::anyhow!("Unknown SortPaletteBy variant: {sort_by}")),
        );
      }
    };
    self.dispatch(
      pattern_id,
      EditorAction::Palette(PaletteAction::Sort {
        sort_by,
        old_positions: None,
      }),
    )
  }

  #[tracing::instrument(name = "EditorWrapper::reorder_palette_items", level = "debug", skip(self), err)]
  fn reorder_palette_items_impl(&self, pattern_id: &str, old_position: u32, new_position: u32) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self.dispatch(
      pattern_id,
      EditorAction::Palette(PaletteAction::Reorder {
        old_position,
        new_position,
        old_positions: None,
      }),
    )
  }

  #[tracing::instrument(
    name = "EditorWrapper::set_palette_item_symbol",
    level = "debug",
    skip(self, symbol_data),
    err
  )]
  fn set_palette_item_symbol_impl(&self, pattern_id: &str, symbol_data: &[u8]) -> Result<(), Error> {
    #[derive(borsh::BorshDeserialize)]
    struct SetSymbolPayload {
      palindex: u32,
      symbol: Option<embroiderly_pattern::Symbol>,
    }
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let SetSymbolPayload { palindex, symbol } = borsh::from_slice(symbol_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Palette(PaletteAction::SetSymbol {
        palindex,
        symbol,
        old_symbol: None,
      }),
    )
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_pattern_info",
    level = "debug",
    skip(self, info_data),
    err
  )]
  fn update_pattern_info_impl(&self, pattern_id: &str, info_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let info = borsh::from_slice(info_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Pattern(PatternAction::UpdateInfo { info, old_info: None }),
    )
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_display_settings",
    level = "debug",
    skip(self, settings_data),
    err
  )]
  fn update_display_settings_impl(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let display_settings = borsh::from_slice(settings_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Display(DisplayAction::Update {
        display_settings,
        old_display_settings: None,
      }),
    )
  }

  #[tracing::instrument(name = "EditorWrapper::add_layer", level = "debug", skip(self), err)]
  fn add_layer_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self.dispatch(pattern_id, EditorAction::Layer(LayerAction::Add { added_index: None }))
  }

  #[tracing::instrument(name = "EditorWrapper::remove_layer", level = "debug", skip(self), err)]
  fn remove_layer_impl(&self, pattern_id: &str, layer_index: u32) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self.dispatch(
      pattern_id,
      EditorAction::Layer(LayerAction::Remove {
        layer_index,
        removed_layer: None,
      }),
    )
  }

  #[tracing::instrument(name = "EditorWrapper::rename_layer", level = "debug", skip(self), err)]
  fn rename_layer_impl(&self, pattern_id: &str, layer_index: u32, name: String) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self.dispatch(
      pattern_id,
      EditorAction::Layer(LayerAction::Rename {
        layer_index,
        name,
        old_name: None,
      }),
    )
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_layer_visibility",
    level = "debug",
    skip(self, visibility_data),
    err
  )]
  fn update_layer_visibility_impl(
    &self,
    pattern_id: &str,
    layer_index: u32,
    visibility_data: &[u8],
  ) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let visibility: LayerVisibility = borsh::from_slice(visibility_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Layer(LayerAction::UpdateVisibility {
        layer_index,
        visibility,
        old_visibility: None,
      }),
    )
  }

  #[tracing::instrument(name = "EditorWrapper::move_layer", level = "debug", skip(self), err)]
  fn move_layer_impl(&self, pattern_id: &str, old_position: u32, new_position: u32) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self.dispatch(
      pattern_id,
      EditorAction::Layer(LayerAction::Move {
        old_position,
        new_position,
        old_positions: None,
      }),
    )
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_pdf_export_options",
    level = "debug",
    skip(self, options_data),
    err
  )]
  fn update_pdf_export_options_impl(&self, pattern_id: &str, options_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let options = borsh::from_slice(options_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Publish(PublishAction::UpdatePdfExportOptions {
        options,
        old_options: None,
      }),
    )
  }

  #[tracing::instrument(
    name = "EditorWrapper::set_reference_image",
    level = "debug",
    skip(self, image_data),
    err
  )]
  fn set_reference_image_impl(&self, pattern_id: &str, image_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let image: ReferenceImage = borsh::from_slice(image_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Image(ImageAction::SetReferenceImage {
        image: Some(image),
        old_image: None,
      }),
    )
  }

  #[tracing::instrument(name = "EditorWrapper::remove_reference_image", level = "debug", skip(self), err)]
  fn remove_reference_image_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    self.dispatch(
      pattern_id,
      EditorAction::Image(ImageAction::SetReferenceImage {
        image: None,
        old_image: None,
      }),
    )
  }

  #[tracing::instrument(
    name = "EditorWrapper::update_reference_image_settings",
    level = "debug",
    skip(self, settings_data),
    err
  )]
  fn update_reference_image_settings_impl(&self, pattern_id: &str, settings_data: &[u8]) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let settings = borsh::from_slice(settings_data)?;
    self.dispatch(
      pattern_id,
      EditorAction::Image(ImageAction::UpdateSettings {
        settings,
        old_settings: None,
      }),
    )
  }

  #[tracing::instrument(name = "EditorWrapper::undo", level = "debug", skip(self), err)]
  fn undo_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let events = self.run(|editor| editor.undo(&pattern_id))?;
    self.send_events(events)
  }

  #[tracing::instrument(name = "EditorWrapper::redo", level = "debug", skip(self), err)]
  fn redo_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let events = self.run(|editor| editor.redo(&pattern_id))?;
    self.send_events(events)
  }

  #[tracing::instrument(name = "EditorWrapper::undo_transaction", level = "debug", skip(self), err)]
  fn undo_transaction_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let events = self.run(|editor| editor.undo_transaction(&pattern_id))?;
    self.send_events(events)
  }

  #[tracing::instrument(name = "EditorWrapper::redo_transaction", level = "debug", skip(self), err)]
  fn redo_transaction_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    let events = self.run(|editor| editor.redo_transaction(&pattern_id))?;
    self.send_events(events)
  }

  #[tracing::instrument(name = "EditorWrapper::start_transaction", level = "debug", skip(self), err)]
  fn start_transaction_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    Ok(self.run(|editor| editor.start_transaction(&pattern_id))?)
  }

  #[tracing::instrument(name = "EditorWrapper::end_transaction", level = "debug", skip(self), err)]
  fn end_transaction_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    Ok(self.run(|editor| editor.end_transaction(&pattern_id))?)
  }

  #[tracing::instrument(name = "EditorWrapper::checkpoint", level = "debug", skip(self), err)]
  fn checkpoint_impl(&self, pattern_id: &str) -> Result<(), Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    Ok(self.run(|editor| editor.checkpoint(&pattern_id))?)
  }

  #[tracing::instrument(name = "EditorWrapper::has_unsaved_changes", level = "debug", skip(self), ret, err)]
  fn has_unsaved_changes_impl(&self, pattern_id: &str) -> Result<bool, Error> {
    let pattern_id = uuid::Uuid::parse_str(pattern_id)?;
    Ok(self.run(|editor| editor.has_unsaved_changes(&pattern_id))?)
  }
}
