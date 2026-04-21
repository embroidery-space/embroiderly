fn main() {
  let attributes = tauri_build::Attributes::new().plugin("log", tauri_build::InlinedPlugin::new().commands(&["log"]));
  tauri_build::try_build(attributes).expect("failed to run tauri-build");
}
