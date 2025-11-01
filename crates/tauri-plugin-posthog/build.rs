const COMMANDS: &[&str] = &["capture_event"];

fn main() {
  tauri_plugin::Builder::new(COMMANDS).build();
}
