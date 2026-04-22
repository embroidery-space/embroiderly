#![doc = include_str!("../README.md")]

mod editor;
pub use editor::Editor;

pub mod actions;
pub use actions::EditorAction;

mod event;
pub use event::*;

mod history;
pub use history::History;

mod error;
pub use error::*;
