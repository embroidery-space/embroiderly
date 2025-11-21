use std::collections::HashMap;
use std::sync::Arc;

use tauri::async_runtime::{Mutex, RwLock};

use crate::error::Result;

mod image;
pub use image::*;

mod publish;
pub use publish::*;

mod utils;

/// Trait for executing sidecar commands.
/// This trait is designed for one-shot commands like regular CLIs.
pub trait SidecarRunner {
  /// Execute the sidecar command asynchronously and capture the output.
  async fn run_async(self) -> Result<Output>;

  /// Execute the sidecar command synchronously and capture the output.
  fn run(self) -> Result<Output>
  where
    Self: Sized,
  {
    tauri::async_runtime::block_on(self.run_async())
  }
}

/// Trait for controlling sidecar processes.
/// This trait is designed for long-running processes that need to be started, communicated with, and stopped.
#[async_trait::async_trait]
pub trait SidecarController: Send + Sync {
  /// Spawn the sidecar process.
  /// Returns the sidecar ID (its process id).
  async fn spawn(&mut self) -> Result<SidecarId>;
  /// Shut down the sidecar process.
  async fn shutdown(&mut self) -> Result<Output>;

  /// Send a message to the sidecar process.
  async fn send_message(&mut self, message: Vec<u8>) -> Result<()>;
  /// Receive a response from the sidecar process.
  async fn get_response(&mut self) -> Result<Vec<u8>>;
}

/// The output of a finished sidecar process.
pub struct Output {
  /// The exit status of the sidecar process.
  pub status: ExitStatus,
  /// The data that the process wrote to stdout.
  pub stdout: Vec<u8>,
  /// The data that the process wrote to stdout.
  #[allow(unused)]
  pub stderr: Vec<u8>,
}

/// Describes the result of a process after it has terminated.
#[derive(Debug)]
pub struct ExitStatus {
  code: Option<i32>,
}

impl ExitStatus {
  /// Returns the exit code of the process, if any.
  pub const fn code(&self) -> Option<i32> {
    self.code
  }

  /// Returns true if exit status is zero.
  /// Signal termination is not considered a success, and success is defined as a zero exit status.
  pub fn success(&self) -> bool {
    self.code == Some(0)
  }
}

// We use `Arc<Mutex<...>>` for the inner value so we can clone a reference to the specific sidecar and drop the map lock immediately.
pub type SharedSidecar = Arc<Mutex<Box<dyn SidecarController + Send + Sync>>>;
pub type SidecarId = u32;

#[derive(Default, Clone)]
pub struct SidecarManager {
  children: Arc<RwLock<HashMap<SidecarId, SharedSidecar>>>,
}

impl SidecarManager {
  pub fn new() -> Self {
    Self::default()
  }

  /// Registers a new sidecar.
  pub async fn insert(&self, id: SidecarId, sidecar: Box<dyn SidecarController + Send + Sync>) {
    let mut children = self.children.write().await;
    children.insert(id, Arc::new(Mutex::new(sidecar)));
  }

  /// Returns a handle to a specific sidecar.
  pub async fn get(&self, id: SidecarId) -> Option<SharedSidecar> {
    let children = self.children.read().await;
    children.get(&id).cloned()
  }

  /// Removes a sidecar.
  pub async fn remove(&self, id: SidecarId) -> Option<SharedSidecar> {
    let mut children = self.children.write().await;
    children.remove(&id)
  }
}
