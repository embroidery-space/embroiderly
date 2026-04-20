use futures::StreamExt as _;
use js_sys::Uint8Array;
use js_sys::futures::JsFuture;
use js_sys::futures::stream::JsStream;

use crate::error::Error;

/// A handle to a file in the OPFS.
#[derive(Debug, Clone)]
pub struct FileHandle(web_sys::FileSystemFileHandle);

impl FileHandle {
  /// Reads the contents of the file.
  pub async fn read(&self) -> Result<Vec<u8>, Error> {
    let file = web_sys::File::from(JsFuture::from(self.0.get_file()).await?);
    let buffer = JsFuture::from(file.array_buffer()).await?;
    Ok(Uint8Array::new(&buffer).to_vec())
  }

  /// Writes the contents to the file.
  pub async fn write(&self, data: &[u8]) -> Result<(), Error> {
    let fs_options = web_sys::FileSystemCreateWritableOptions::new();
    let writer = web_sys::FileSystemWritableFileStream::from(
      JsFuture::from(self.0.create_writable_with_options(&fs_options)).await?,
    );
    JsFuture::from(writer.write_with_u8_array(data)?).await?;
    JsFuture::from(writer.close()).await?;
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

impl DirectoryHandle {
  /// Returns a handle to a file in this directory.
  pub async fn get_file_handle(&self, name: &str, options: GetFileHandleOptions) -> Result<FileHandle, Error> {
    let fs_options = web_sys::FileSystemGetFileOptions::new();
    fs_options.set_create(options.create);

    let fs_file_handle = web_sys::FileSystemFileHandle::from(
      JsFuture::from(self.0.get_file_handle_with_options(name, &fs_options)).await?,
    );

    Ok(FileHandle(fs_file_handle))
  }

  /// Returns a handle to a directory in this directory.
  pub async fn get_directory_handle(&self, name: &str, options: GetDirectoryHandleOptions) -> Result<Self, Error> {
    let fs_options = web_sys::FileSystemGetDirectoryOptions::new();
    fs_options.set_create(options.create);

    let fs_directory_handle = web_sys::FileSystemDirectoryHandle::from(
      JsFuture::from(self.0.get_directory_handle_with_options(name, &fs_options)).await?,
    );

    Ok(Self(fs_directory_handle))
  }

  /// Removes an entry (file or empty directory) from this directory.
  pub async fn remove_entry(&self, name: &str) -> Result<(), Error> {
    JsFuture::from(self.0.remove_entry(name)).await?;
    Ok(())
  }

  /// Returns a list of keys for the entries in this directory.
  pub async fn keys(&self) -> Result<Vec<String>, Error> {
    let mut stream = JsStream::from(self.0.keys());
    let mut keys = Vec::new();

    while let Some(item) = stream.next().await {
      let key = item?
        .as_string()
        .ok_or_else(|| anyhow::anyhow!("Invalid directory entry key"))?;
      keys.push(key);
    }

    Ok(keys)
  }
}

/// Returns a directory handle for the root OPFS directory.
pub async fn get_root_dir() -> Result<DirectoryHandle, Error> {
  let window = web_sys::window().unwrap();
  let navigator = window.navigator();

  let root_directory_handle =
    web_sys::FileSystemDirectoryHandle::from(JsFuture::from(navigator.storage().get_directory()).await?);

  Ok(DirectoryHandle(root_directory_handle))
}
