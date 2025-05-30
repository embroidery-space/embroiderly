// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![warn(
  clippy::print_stdout,
  clippy::print_stderr,
  reason = "Print statements are not allowed. Use the log crate instead."
)]

fn main() {
  let app = embroiderly::setup_app(tauri::Builder::default());

  #[allow(unused_variables)]
  app.run(|app_handle, event| {
    // Yeah, we don't currently support MacOS, but keep the code for future use.
    #[cfg(any(target_os = "macos", target_os = "ios"))]
    if let tauri::RunEvent::Opened { urls } = event {
      let files = urls
        .into_iter()
        .filter_map(|url| url.to_file_path().ok())
        .collect::<Vec<_>>();

      embroiderly::handle_file_associations(app_handle, files);
    }
  });
}
