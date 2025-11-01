const COMMANDS: &[&str] = &["envelope", "add_breadcrumb"];

fn main() {
  tauri_plugin::Builder::new(COMMANDS).build();
}
