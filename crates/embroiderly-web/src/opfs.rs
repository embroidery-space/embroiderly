use futures::StreamExt as _;
use js_sys::Uint8Array;
use js_sys::futures::JsFuture;
use js_sys::futures::stream::JsStream;

use crate::Error;
use crate::error::js_to_anyhow;

/// A handle to a file in the OPFS.
#[derive(Debug, Clone)]
pub struct FileHandle(web_sys::FileSystemFileHandle);

impl From<web_sys::FileSystemFileHandle> for FileHandle {
  fn from(handle: web_sys::FileSystemFileHandle) -> Self {
    Self(handle)
  }
}

impl FileHandle {
  /// Returns the underlying `FileSystemFileHandle`.
  #[must_use]
  pub fn into_inner(self) -> web_sys::FileSystemFileHandle {
    self.0
  }

  /// Returns the file name.
  #[must_use]
  pub fn name(&self) -> String {
    self.0.name()
  }

  /// Reads the contents of the file.
  pub async fn read(&self) -> Result<Vec<u8>, Error> {
    let file = web_sys::File::from(JsFuture::from(self.0.get_file()).await.map_err(opfs_err)?);
    let buffer = JsFuture::from(file.array_buffer()).await.map_err(opfs_err)?;
    Ok(Uint8Array::new(&buffer).to_vec())
  }

  /// Writes the contents to the file.
  pub async fn write(&self, data: &[u8]) -> Result<(), Error> {
    let fs_options = web_sys::FileSystemCreateWritableOptions::new();
    let writer = web_sys::FileSystemWritableFileStream::from(
      JsFuture::from(self.0.create_writable_with_options(&fs_options))
        .await
        .map_err(opfs_err)?,
    );
    JsFuture::from(writer.write_with_u8_array(data).map_err(opfs_err)?)
      .await
      .map_err(opfs_err)?;
    JsFuture::from(writer.close()).await.map_err(opfs_err)?;
    Ok(())
  }
}

/// Options for getting a file handle.
#[derive(Debug, Clone, Copy, Default)]
pub struct GetFileHandleOptions {
  /// Whether to create the file if it doesn't exist.
  pub create: bool,
}

/// Options for getting a directory handle.
#[derive(Debug, Clone, Copy, Default)]
pub struct GetDirectoryHandleOptions {
  /// Whether to create the directory if it doesn't exist.
  pub create: bool,
}

/// A handle to a directory in the OPFS.
#[derive(Debug, Clone)]
pub struct DirectoryHandle(web_sys::FileSystemDirectoryHandle);

impl From<web_sys::FileSystemDirectoryHandle> for DirectoryHandle {
  fn from(handle: web_sys::FileSystemDirectoryHandle) -> Self {
    Self(handle)
  }
}

impl DirectoryHandle {
  /// Returns a handle to a file in this directory.
  pub async fn get_file_handle(&self, name: &str, options: GetFileHandleOptions) -> Result<FileHandle, Error> {
    let fs_options = web_sys::FileSystemGetFileOptions::new();
    fs_options.set_create(options.create);

    let fs_file_handle = web_sys::FileSystemFileHandle::from(
      JsFuture::from(self.0.get_file_handle_with_options(name, &fs_options))
        .await
        .map_err(opfs_err)?,
    );

    Ok(fs_file_handle.into())
  }

  /// Like `get_file_handle` but returns `Ok(None)` when the file does not exist.
  pub async fn try_get_file_handle(
    &self,
    name: &str,
    options: GetFileHandleOptions,
  ) -> Result<Option<FileHandle>, Error> {
    let fs_options = web_sys::FileSystemGetFileOptions::new();
    fs_options.set_create(options.create);

    match JsFuture::from(self.0.get_file_handle_with_options(name, &fs_options)).await {
      Ok(handle) => Ok(Some(web_sys::FileSystemFileHandle::from(handle).into())),
      Err(err) if is_not_found(&err) => Ok(None),
      Err(err) => Err(opfs_err(err)),
    }
  }

  /// Returns a handle to a directory in this directory.
  pub async fn get_directory_handle(&self, name: &str, options: GetDirectoryHandleOptions) -> Result<Self, Error> {
    let fs_options = web_sys::FileSystemGetDirectoryOptions::new();
    fs_options.set_create(options.create);

    let fs_directory_handle = web_sys::FileSystemDirectoryHandle::from(
      JsFuture::from(self.0.get_directory_handle_with_options(name, &fs_options))
        .await
        .map_err(opfs_err)?,
    );

    Ok(fs_directory_handle.into())
  }

  /// Removes an entry (file or empty directory) from this directory.
  pub async fn remove_entry(&self, name: &str) -> Result<(), Error> {
    JsFuture::from(self.0.remove_entry(name)).await.map_err(opfs_err)?;
    Ok(())
  }

  /// Returns a list of keys for the entries in this directory.
  pub async fn keys(&self) -> Result<Vec<String>, Error> {
    let mut stream = JsStream::from(self.0.keys());
    let mut keys = Vec::new();

    while let Some(item) = stream.next().await {
      let key = item
        .map_err(opfs_err)?
        .as_string()
        .ok_or_else(|| Error::Opfs(anyhow::anyhow!("Invalid directory entry key")))?;
      keys.push(key);
    }

    Ok(keys)
  }
}

/// Returns a directory handle for the root OPFS directory.
pub async fn get_root_dir() -> Result<DirectoryHandle, Error> {
  let window = web_sys::window().unwrap();
  let navigator = window.navigator();

  let root_directory_handle = web_sys::FileSystemDirectoryHandle::from(
    JsFuture::from(navigator.storage().get_directory())
      .await
      .map_err(opfs_err)?,
  );

  Ok(DirectoryHandle(root_directory_handle))
}

fn opfs_err(e: wasm_bindgen::JsValue) -> Error {
  Error::Opfs(js_to_anyhow(e))
}

fn is_not_found(err: &wasm_bindgen::JsValue) -> bool {
  js_sys::Reflect::get(err, &wasm_bindgen::JsValue::from_str("name"))
    .ok()
    .and_then(|v| v.as_string())
    .is_some_and(|name| name == "NotFoundError")
}
