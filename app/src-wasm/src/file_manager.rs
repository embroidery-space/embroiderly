use embroiderly_pattern::{BrandPaletteItem, FabricColor};
use js_sys::{Reflect, Uint8Array};
use wasm_bindgen::prelude::*;

use crate::error::{Error, ErrorKind};
use crate::web::opfs::DirectoryHandle;
use crate::web::{net, opfs};

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"
export interface ImportFilesItem {
  name: string;
  data: Uint8Array;
}
"#;

#[wasm_bindgen]
extern "C" {
  #[wasm_bindgen(typescript_type = "ImportFilesItem")]
  pub type ImportFilesItem;
}

#[derive(Debug)]
#[wasm_bindgen(getter_with_clone)]
pub struct ImportFilesResult {
  #[wasm_bindgen(js_name = "failedFiles")]
  pub failed_files: Vec<String>,
}

#[derive(Debug)]
#[wasm_bindgen(getter_with_clone)]
pub struct GroupedFilesList {
  pub system: Vec<String>,
  pub custom: Vec<String>,
}

#[wasm_bindgen]
pub struct FileManager {
  palettes_dir: opfs::DirectoryHandle,
  fonts_dir: opfs::DirectoryHandle,
}

// Public methods which delegate the execution to private instrumented implementations.
#[wasm_bindgen]
impl FileManager {
  /// Opens (and creates if needed) the OPFS subdirectories for palettes and fonts.
  #[expect(clippy::future_not_send)]
  pub async fn create() -> Result<Self, Error> {
    Self::create_impl().await
  }

  /// Returns a Borsh-encoded list of fabric colors.
  #[wasm_bindgen(js_name = "loadFabricColors")]
  pub async fn load_fabric_colors(&self) -> Result<Vec<u8>, Error> {
    self.load_fabric_colors_impl().await
  }

  /// Returns a complete list of the available palettes.
  #[wasm_bindgen(js_name = "getPalettesList")]
  pub async fn get_palettes_list(&self) -> Result<GroupedFilesList, Error> {
    self.get_palettes_list_impl().await
  }

  /// Returns a Borsh-encoded brand palette.
  #[wasm_bindgen(js_name = "loadPalette")]
  pub async fn load_palette(&self, group: String, name: String) -> Result<Vec<u8>, Error> {
    self.load_palette_impl(group, name).await
  }

  /// Processes the provided palettes and saves them to the OPFS.
  #[wasm_bindgen(js_name = "importPalettes")]
  pub async fn import_palettes(&self, files: Vec<ImportFilesItem>) -> Result<ImportFilesResult, Error> {
    self.import_palettes_impl(files).await
  }

  /// Returns a complete list of the available symbol fonts.
  #[wasm_bindgen(js_name = "getFontsList")]
  pub async fn get_fonts_list(&self) -> Result<GroupedFilesList, Error> {
    self.get_fonts_list_impl().await
  }

  /// Returns the raw TTF/OTF bytes for the given font name.
  #[wasm_bindgen(js_name = "loadFontContent")]
  pub async fn load_font_content(&self, name: &str) -> Result<Vec<u8>, Error> {
    self.load_font_content_impl(name).await
  }

  /// Returns the Unicode code points present in the given font.
  #[wasm_bindgen(js_name = "loadFontCodePoints")]
  pub async fn load_font_code_points(&self, name: &str) -> Result<Vec<u32>, Error> {
    self.load_font_code_points_impl(name).await
  }

  /// Processes the provided font files and saves them to the OPFS.
  #[wasm_bindgen(js_name = "importFonts")]
  pub async fn import_fonts(&self, files: Vec<ImportFilesItem>) -> Result<ImportFilesResult, Error> {
    self.import_fonts_impl(files).await
  }
}

// Private helpers and instrumented implementations.
// Must not be exposed via `#[wasm_bindgen]`.
impl FileManager {
  /// Iterates over the entries in the provided directory and returns a list of file names without extensions.
  async fn list_file_names(dir: &DirectoryHandle) -> Result<Vec<String>, Error> {
    let mut file_names = Vec::new();
    for key in dir.keys().await? {
      let file_path = std::path::Path::new(&key);
      file_names.push(
        file_path
          .file_stem()
          .and_then(|s| s.to_str())
          .ok_or_else(|| anyhow::anyhow!("Invalid entry file name"))?
          .to_owned(),
      );
    }
    Ok(file_names)
  }

  #[tracing::instrument(name = "FileManager::create", level = "debug", err)]
  async fn create_impl() -> Result<Self, Error> {
    let root = opfs::get_root_dir().await?;

    let options = opfs::GetDirectoryHandleOptions { create: true };

    let palettes_dir = root.get_directory_handle("palettes", options).await?;
    let fonts_dir = root.get_directory_handle("fonts", options).await?;

    Ok(Self {
      palettes_dir,
      fonts_dir,
    })
  }

  #[tracing::instrument(name = "FileManager::load_fabric_colors", level = "debug", skip(self), err)]
  async fn load_fabric_colors_impl(&self) -> Result<Vec<u8>, Error> {
    let fabric_colors: Vec<FabricColor> = serde_json::from_slice(&net::fetch("/fabric-colors.json").await?)?;
    Ok(borsh::to_vec(&fabric_colors)?)
  }

  #[tracing::instrument(name = "FileManager::get_palettes_list", level = "debug", skip(self), ret, err)]
  async fn get_palettes_list_impl(&self) -> Result<GroupedFilesList, Error> {
    let system = serde_json::from_slice(&net::fetch("/palettes/index.json").await?)?;
    let custom = Self::list_file_names(&self.palettes_dir).await?;
    Ok(GroupedFilesList { system, custom })
  }

  #[tracing::instrument(name = "FileManager::load_palette", level = "debug", skip(self), err)]
  async fn load_palette_impl(&self, group: String, name: String) -> Result<Vec<u8>, Error> {
    let buffer = match group.as_str() {
      "system" => net::fetch(&format!("/palettes/{name}.json")).await?,
      "custom" => {
        let file_handle = self
          .palettes_dir
          .get_file_handle(&format!("{name}.json"), Default::default())
          .await?;
        tracing::debug!("{file_handle:?}");
        file_handle.read().await?
      }
      _ => {
        return Err(Error::new(ErrorKind::UnknownPaletteGroup(group)));
      }
    };
    let palette: Vec<BrandPaletteItem> = serde_json::from_slice(&buffer)?;
    Ok(borsh::to_vec(&palette)?)
  }

  #[tracing::instrument(name = "FileManager::import_palettes", level = "debug", skip_all, fields(total_files = files.len(), failed_files), err)]
  async fn import_palettes_impl(&self, files: Vec<ImportFilesItem>) -> Result<ImportFilesResult, Error> {
    let mut failed_files = Vec::new();

    for file in files {
      let file_name = Reflect::get(&file, &JsValue::from_str("name"))?
        .as_string()
        .unwrap_or_default();
      let data = Uint8Array::new(&Reflect::get(&file, &JsValue::from_str("data"))?).to_vec();

      if process_and_save_palette(&file_name, &data, &self.palettes_dir)
        .await
        .is_err()
      {
        failed_files.push(file_name);
      }
    }

    tracing::Span::current().record("failed_files", failed_files.len());
    Ok(ImportFilesResult { failed_files })
  }

  #[tracing::instrument(name = "FileManager::get_fonts_list", level = "debug", skip(self), ret, err)]
  async fn get_fonts_list_impl(&self) -> Result<GroupedFilesList, Error> {
    let system = serde_json::from_slice(&net::fetch("/fonts/index.json").await?)?;
    let custom = Self::list_file_names(&self.fonts_dir).await?;
    Ok(GroupedFilesList { system, custom })
  }

  #[tracing::instrument(name = "FileManager::load_font_content", level = "debug", skip(self), err)]
  async fn load_font_content_impl(&self, name: &str) -> Result<Vec<u8>, Error> {
    for ext in ["ttf", "otf"] {
      if let Ok(bytes) = net::fetch(&format!("/fonts/{name}.{ext}")).await {
        return Ok(bytes);
      }
    }

    for ext in ["ttf", "otf"] {
      if let Ok(file_handle) = self
        .fonts_dir
        .get_file_handle(&format!("{name}.{ext}"), Default::default())
        .await
        && let Ok(bytes) = file_handle.read().await
      {
        return Ok(bytes);
      }
    }

    Err(Error::new(ErrorKind::PatternNotFound))
  }

  #[tracing::instrument(name = "FileManager::load_font_code_points", level = "debug", skip(self), err)]
  async fn load_font_code_points_impl(&self, name: &str) -> Result<Vec<u32>, Error> {
    let data = self.load_font_content_impl(name).await?;
    let font_face = ttf_parser::Face::parse(&data, 0).map_err(|e| anyhow::anyhow!("Failed to parse font: {e:?}"))?;

    let glyph_count = font_face.number_of_glyphs();

    let mut code_points = Vec::new();
    for subtable in font_face.tables().cmap.into_iter().flat_map(|cmap| cmap.subtables) {
      if matches!(
        subtable.format,
        ttf_parser::cmap::Format::SegmentMappingToDeltaValues(..)
      ) {
        subtable.codepoints(|codepoint| {
          if let Some(glyph_id) = subtable.glyph_index(codepoint) {
            let glyph_index = glyph_id.0;
            if glyph_index != 0 && glyph_index < glyph_count && matches!(codepoint, 0x0021..=0xD7FF | 0xE000..=0xFFFD) {
              code_points.push(codepoint);
            }
          }
        });
      } else {
        break;
      }
    }

    code_points.sort_unstable();
    code_points.dedup();

    Ok(code_points)
  }

  #[tracing::instrument(name = "FileManager::import_fonts", level = "debug", skip_all, fields(total_files = files.len(), failed_files), err)]
  async fn import_fonts_impl(&self, files: Vec<ImportFilesItem>) -> Result<ImportFilesResult, Error> {
    let mut failed_files = Vec::new();

    for file in files {
      let file_name = Reflect::get(&file, &JsValue::from_str("name"))?
        .as_string()
        .unwrap_or_default();
      let data = Uint8Array::new(&Reflect::get(&file, &JsValue::from_str("data"))?).to_vec();

      if process_and_save_font(&file_name, &data, &self.fonts_dir).await.is_err() {
        failed_files.push(file_name);
      }
    }

    tracing::Span::current().record("failed_files", failed_files.len());
    Ok(ImportFilesResult { failed_files })
  }
}

async fn process_and_save_palette(file_name: &str, data: &[u8], dir: &opfs::DirectoryHandle) -> Result<(), Error> {
  let path = std::path::Path::new(file_name);
  let extension = path
    .extension()
    .and_then(|s| s.to_str())
    .ok_or_else(|| anyhow::anyhow!("Invalid font file extension"))?
    .to_lowercase();
  let palette_name = path
    .file_stem()
    .and_then(|s| s.to_str())
    .ok_or_else(|| anyhow::anyhow!("Invalid palette file name"))?
    .to_owned();

  let palette: Vec<BrandPaletteItem> = match extension.as_str() {
    "master" | "user" => xsp_parsers::pmaker::parse_palette_from_bytes(data, file_name)
      .map_err(anyhow::Error::from)?
      .into_iter()
      .map(BrandPaletteItem::from)
      .collect(),

    "threads" => xsp_parsers::ursa::parse_palette_from_bytes(data)
      .map_err(anyhow::Error::from)?
      .into_iter()
      .map(BrandPaletteItem::from)
      .collect(),

    "rng" => xsp_parsers::xspro::parse_palette_from_bytes(data)
      .map_err(anyhow::Error::from)?
      .into_iter()
      .map(BrandPaletteItem::from)
      .collect(),

    "json" => serde_json::from_slice(data).map_err(anyhow::Error::from)?,

    _ => {
      return Err(Error::new(ErrorKind::UnsupportedPaletteType(extension)));
    }
  };
  let data = serde_json::to_vec(&palette)?;

  // TODO: Replace `create: true` with checking that the file exists (prevent overwrites).
  let file_handle = dir
    .get_file_handle(
      &format!("{palette_name}.json"),
      opfs::GetFileHandleOptions { create: true },
    )
    .await?;
  file_handle.write(&data).await
}

async fn process_and_save_font(file_name: &str, data: &[u8], dir: &opfs::DirectoryHandle) -> Result<(), Error> {
  let font_face = ttf_parser::Face::parse(data, 0).map_err(|e| anyhow::anyhow!("Failed to parse font: {e}"))?;
  let font_family = font_face
    .names()
    .into_iter()
    .find(|name| name.name_id == ttf_parser::name_id::FAMILY)
    .and_then(|name| {
      // Try decode Unicode first (default approach).
      let font_family = name.to_string();
      if font_family.is_some() {
        return font_family;
      }

      // Then, try decode Macintosh.
      if name.platform_id == ttf_parser::PlatformId::Macintosh && name.encoding_id == 0 {
        let (decoded, _, _) = encoding_rs::MACINTOSH.decode(name.name);
        return Some(decoded.into_owned());
      }

      // Give up.
      None
    })
    .ok_or_else(|| anyhow::anyhow!("Font does not have family name"))?;

  let path = std::path::Path::new(file_name);
  let extension = path
    .extension()
    .and_then(|s| s.to_str())
    .ok_or_else(|| anyhow::anyhow!("Invalid font file extension"))?;

  // TODO: Replace `create: true` with checking that the file exists (prevent overwrites).
  let file_handle = dir
    .get_file_handle(
      &format!("{font_family}.{extension}"),
      opfs::GetFileHandleOptions { create: true },
    )
    .await?;
  file_handle.write(data).await
}
