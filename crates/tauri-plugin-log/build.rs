const COMMANDS: &[&str] = &["log"];

fn main() {
  tauri_plugin::Builder::new(COMMANDS).build();
}
