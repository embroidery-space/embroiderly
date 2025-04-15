// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![warn(
  clippy::print_stdout,
  clippy::print_stderr,
  reason = "Print statements are not allowed. Use the log crate instead."
)]

fn main() {
  let app = embroiderly::setup_app(tauri::Builder::default());
  app.run(|_, _| {});
}
