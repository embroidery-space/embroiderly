use embroiderly::state::PatternsState;
use embroiderly_pattern::PatternProject;
use tauri::Manager as _;

/// Creates a new pattern project with defaults and adds it to the patterns state.
/// Returns the ID of the created pattern.
#[allow(unused)]
pub fn create_test_pattern<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> uuid::Uuid {
  let patproj = PatternProject::new(
    std::path::PathBuf::from("test_pattern.embproj"),
    Default::default(),
    Default::default(),
    Default::default(),
  );
  let pattern_id = patproj.id;

  let patterns_state = app_handle.state::<PatternsState>();
  patterns_state.write().unwrap().add_pattern(patproj);

  pattern_id
}
