mod publish;
pub use publish::*;

/// Trait for executing sidecar commands.
pub trait SidecarRunner {
  /// Execute the sidecar command asynchronously and return the output.
  async fn run_async(self) -> crate::error::Result<tauri_plugin_shell::process::Output>;

  /// Execute the sidecar command synchronously and return the output.
  fn run(self) -> crate::error::Result<tauri_plugin_shell::process::Output>
  where
    Self: Sized,
  {
    tauri::async_runtime::block_on(self.run_async())
  }
}
