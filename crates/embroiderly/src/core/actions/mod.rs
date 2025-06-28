//! This module contains the definition of actions that can be performed on a pattern project.
//! These actions include operations like adding or removing stitches or palette items, updating pattern information, etc.
//!
//! Actually, the actions implements the [`Command`](https://refactoring.guru/design-patterns/command) pattern.
//! Hovewer we named it `Action` to avoid confusion with the `commands` from Tauri.
//!
//! Each method of the `Action` accepts a reference to the `WebviewWindow` and a mutable reference to the `PatternProject`.
//! The `WebviewWindow` is used to emit events to the frontend.
//! The reason for this is that the `Action` can affects many aspects of the `PatternProject` so it is easier to emit an event for each change.

use anyhow::Result;
use embroiderly_pattern::PatternProject;
use tauri::WebviewWindow;

mod pattern;
pub use pattern::*;

mod display;
pub use display::*;

mod fabric;
pub use fabric::*;

mod grid;
pub use grid::*;

mod stitches;
pub use stitches::*;

mod palette;
pub use palette::*;

mod publish;
pub use publish::*;

/// An action that can be executed and revoked.
#[allow(unused_variables)]
pub trait Action<R: tauri::Runtime>: Send + Sync + dyn_clone::DynClone + std::any::Any {
  /// Perform the action.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    Ok(())
  }

  /// Revoke (undo) the action.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    Ok(())
  }
}

dyn_clone::clone_trait_object!(<R: tauri::Runtime> Action<R>);

/// An action that indicates whether the `PatternProject` was saved.
#[derive(Clone)]
pub struct CheckpointAction;
impl<R: tauri::Runtime> Action<R> for CheckpointAction {}

#[cfg(test)]
pub mod mock {
  use super::*;

  #[derive(Clone)]
  pub struct MockAction;
  impl<R: tauri::Runtime> Action<R> for MockAction {}
}
