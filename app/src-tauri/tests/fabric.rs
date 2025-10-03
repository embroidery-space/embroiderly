use embroiderly::commands;
use embroiderly::state::{HistoryState, PatternsState};
use embroiderly_pattern::{Fabric, FabricColor};
use tauri::Manager;

mod utils;

#[test]
fn updates_fabric() {
  let (app, webview) = setup_test_app!(commands: [commands::core::fabric::update_fabric]);

  let pattern_id = utils::create_test_pattern(&app);
  let new_fabric = Fabric {
    width: 200,
    height: 150,
    spi: (18, 18),
    kind: "Aida".to_string(),
    name: "Test Fabric".to_string(),
    color: "#FFFFFF".to_string(),
  };

  // Update the fabric.
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "update_fabric",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&new_fabric).unwrap()),
      headers: [("patternId", pattern_id.to_string().parse().unwrap())]
    )
    .is_ok()
  );

  let patterns_state = app.state::<PatternsState>();
  let patterns_manager = patterns_state.read().unwrap();

  // Verify the fabric was updated.
  let patproj = patterns_manager.get_pattern_by_id(&pattern_id).unwrap();
  assert_eq!(patproj.pattern.fabric, new_fabric);

  let history_state = app.state::<HistoryState<tauri::test::MockRuntime>>();
  let history_manager = history_state.read().unwrap();

  // Verify the action was added to history.
  let history = history_manager.get(&pattern_id).unwrap();
  assert_eq!(history.undo_stack_len(), 1);
}

#[test]
fn loads_fabric_colors() {
  let (_app, webview) = setup_test_app!(commands: [commands::core::fabric::load_fabric_colors]);

  // Load fabric colors.
  let tauri::ipc::InvokeResponseBody::Raw(body) = invoke_ipc!(
    &webview,
    cmd: "load_fabric_colors",
    body: tauri::ipc::InvokeBody::default()
  )
  .unwrap() else {
    panic!("Expected raw body in IPC response");
  };

  // Verify we got valid fabric colors data.
  let fabric_colors: Vec<FabricColor> = borsh::from_slice(&body).unwrap();
  assert!(!fabric_colors.is_empty());
}
