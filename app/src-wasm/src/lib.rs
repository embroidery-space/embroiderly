#![doc = include_str!("../README.md")]
#![allow(clippy::future_not_send)]

use wasm_bindgen::prelude::*;

mod editor_wrapper;
mod error;
mod file_manager;
mod logger;
mod web;

pub use editor_wrapper::EditorWrapper;
pub use file_manager::FileManager;

#[wasm_bindgen(start)]
pub fn init() {
  logger::init();
}
