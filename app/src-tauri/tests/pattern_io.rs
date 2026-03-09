use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

use embroiderly::commands;
use embroiderly::state::PatternsState;
use embroiderly_pattern::Fabric;
use tauri::{Listener as _, Manager as _};

mod utils;

fn get_all_test_patterns() -> Vec<std::io::Result<std::fs::DirEntry>> {
  let sample_patterns = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("resources/patterns");
  let test_patterns = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("testdata/patterns");
  std::fs::read_dir(sample_patterns)
    .unwrap()
    .chain(std::fs::read_dir(test_patterns).unwrap())
    .collect()
}

#[test]
fn parses_supported_pattern_formats() {
  let (app, webview) = setup_test_app!(
    commands: [commands::files::patterns::open_pattern],
    plugins: [tauri_plugin_pinia::init()]
  );
  let patterns_state = app.state::<PatternsState>();

  for file_path in get_all_test_patterns().into_iter() {
    let file_path = file_path.unwrap().path();

    let tauri::ipc::InvokeResponseBody::Json(body) = invoke_ipc!(
      &webview,
      cmd: "open_pattern",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({
        "filePath": file_path.to_str().unwrap(),
        "restoreFromBackup": None::<bool>,
      }))
    )
    .unwrap() else {
      panic!("Expected JSON body in IPC response");
    };
    let pattern_id: uuid::Uuid = serde_json::from_str(&body).unwrap();

    assert!(patterns_state.read().unwrap().get_pattern_by_id(&pattern_id).is_some());
  }
}

#[test]
fn creates_new_pattern() {
  let (app, webview) = setup_test_app!(
    commands: [commands::files::patterns::create_pattern],
    plugins: [tauri_plugin_pinia::init()]
  );
  let patterns_state = app.state::<PatternsState>();

  assert!(patterns_state.read().unwrap().is_empty());
  assert!(
    invoke_ipc!(
      &webview,
      cmd: "create_pattern",
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&Fabric::default()).unwrap())
    )
    .is_ok()
  );
  assert_eq!(patterns_state.read().unwrap().len(), 1);
}

#[test]
fn saves_pattern() {
  let (_app, webview) = setup_test_app!(
    commands: [
      commands::files::patterns::load_pattern,
      commands::files::patterns::open_pattern,
      commands::files::patterns::save_pattern,
      commands::files::patterns::close_pattern,
    ],
    plugins: [tauri_plugin_pinia::init()]
  );

  for file_path in get_all_test_patterns().into_iter() {
    let file_path = file_path.unwrap().path();

    // Loading the pattern first.
    let tauri::ipc::InvokeResponseBody::Json(body) = invoke_ipc!(
      &webview,
      cmd: "open_pattern",
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({
        "filePath": file_path.to_str().unwrap(),
        "restoreFromBackup": None::<bool>,
      }))
    )
    .unwrap() else {
      panic!("Expected JSON body in IPC response");
    };
    let pattern_id: uuid::Uuid = serde_json::from_str(&body).unwrap();

    for extension in ["oxs", "embproj"] {
      let file_path = std::env::temp_dir().join(format!("pattern.{extension}"));

      let checkpoint_received = Arc::new(AtomicBool::new(false));
      webview.once("app:pattern-checkpoint", {
        let checkpoint_received = checkpoint_received.clone();
        move |_| checkpoint_received.store(true, Ordering::Relaxed)
      });

      // If we can save the pattern and then parse it back, we can consider it a success.
      assert!(
        invoke_ipc!(
          &webview,
          cmd: "save_pattern",
          body: tauri::ipc::InvokeBody::Json(serde_json::json!({
            "patternId": pattern_id.to_string(),
            "filePath": file_path.to_str().unwrap(),
          }))
        )
        .is_ok()
      );

      assert!(checkpoint_received.load(Ordering::Relaxed));
      assert!(
        invoke_ipc!(
          &webview,
          cmd: "load_pattern",
          body: tauri::ipc::InvokeBody::Json(serde_json::json!({
            "patternId": pattern_id.to_string(),
          }))
        )
        .is_ok()
      );
    }

    assert!(
      invoke_ipc!(
        &webview,
        cmd: "close_pattern",
        body: tauri::ipc::InvokeBody::Json(serde_json::json!({
          "patternId": pattern_id.to_string(),
        }))
      )
      .is_ok()
    );
  }
}

#[test]
fn closes_pattern() {
  let (app, webview) = setup_test_app!(
    commands: [
      commands::files::patterns::create_pattern,
      commands::files::patterns::close_pattern,
    ],
    plugins: [tauri_plugin_pinia::init()]
  );
  let patterns_state = app.state::<PatternsState>();

  assert!(patterns_state.read().unwrap().is_empty());
  let tauri::ipc::InvokeResponseBody::Json(body) = invoke_ipc!(
    &webview,
    cmd: "create_pattern",
    body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&Fabric::default()).unwrap())
  )
  .unwrap() else {
    panic!("Expected JSON body in IPC response");
  };
  let pattern_id: uuid::Uuid = serde_json::from_str(&body).unwrap();

  invoke_ipc!(
    &webview,
    cmd: "close_pattern",
    body: tauri::ipc::InvokeBody::Json(serde_json::json!({
      "patternId": pattern_id.to_string(),
    }))
  )
  .unwrap();
  assert!(patterns_state.read().unwrap().is_empty());
}
