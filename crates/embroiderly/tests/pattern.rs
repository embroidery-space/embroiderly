use embroiderly::state::PatternsState;
use embroiderly::{Fabric, PatternProject, setup_app};
use tauri::Manager;
use tauri::test::{INVOKE_KEY, MockRuntime, get_ipc_response, mock_builder};

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
  let app = setup_app::<MockRuntime>(mock_builder());
  let webview = tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
    .build()
    .unwrap();
  let patterns_state = app.handle().state::<PatternsState>();

  for file_path in get_all_test_patterns().into_iter() {
    let file_path = file_path.unwrap().path();

    let tauri::ipc::InvokeResponseBody::Raw(body) = get_ipc_response(
      &webview,
      tauri::webview::InvokeRequest {
        cmd: "open_pattern".to_string(),
        callback: tauri::ipc::CallbackFn(0),
        error: tauri::ipc::CallbackFn(1),
        url: "http://tauri.localhost".parse().unwrap(),
        body: tauri::ipc::InvokeBody::Json(serde_json::json!({
          "filePath": file_path.to_str().unwrap(),
          "restoreFromBackup": None::<bool>,
        })),
        headers: Default::default(),
        invoke_key: INVOKE_KEY.to_string(),
      },
    )
    .unwrap() else {
      panic!("Expected raw body in IPC response");
    };
    let patproj: PatternProject = borsh::from_slice(&body).unwrap();

    assert!(patterns_state.read().unwrap().get_pattern_by_id(&patproj.id).is_some());
  }
}

#[test]
fn creates_new_pattern() {
  let app = setup_app::<MockRuntime>(mock_builder());
  let webview = tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
    .build()
    .unwrap();
  let patterns_state = app.handle().state::<PatternsState>();

  assert!(patterns_state.read().unwrap().is_empty());
  assert!(
    get_ipc_response(
      &webview,
      tauri::webview::InvokeRequest {
        cmd: "create_pattern".to_string(),
        callback: tauri::ipc::CallbackFn(0),
        error: tauri::ipc::CallbackFn(1),
        url: "http://tauri.localhost".parse().unwrap(),
        body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&Fabric::default()).unwrap()),
        headers: Default::default(),
        invoke_key: INVOKE_KEY.to_string(),
      },
    )
    .is_ok()
  );
  assert_eq!(patterns_state.read().unwrap().len(), 1);
}

#[test]
fn saves_pattern() {
  let app = setup_app::<MockRuntime>(mock_builder());
  let webview = tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
    .build()
    .unwrap();

  for file_path in get_all_test_patterns().into_iter() {
    let file_path = file_path.unwrap().path();

    // Loading the pattern first.
    let tauri::ipc::InvokeResponseBody::Raw(body) = get_ipc_response(
      &webview,
      tauri::webview::InvokeRequest {
        cmd: "open_pattern".to_string(),
        callback: tauri::ipc::CallbackFn(0),
        error: tauri::ipc::CallbackFn(1),
        url: "http://tauri.localhost".parse().unwrap(),
        body: tauri::ipc::InvokeBody::Json(serde_json::json!({
          "filePath": file_path.to_str().unwrap(),
          "restoreFromBackup": None::<bool>,
        })),
        headers: Default::default(),
        invoke_key: INVOKE_KEY.to_string(),
      },
    )
    .unwrap() else {
      panic!("Expected raw body in IPC response");
    };
    let patproj: PatternProject = borsh::from_slice(&body).unwrap();

    for extension in ["oxs", "embproj"] {
      let file_path = std::env::temp_dir().join(format!("pattern.{}", extension));

      // If we can save the pattern and then parse it back, we can consider it a success.
      assert!(
        get_ipc_response(
          &webview,
          tauri::webview::InvokeRequest {
            cmd: "save_pattern".to_string(),
            callback: tauri::ipc::CallbackFn(0),
            error: tauri::ipc::CallbackFn(1),
            url: "http://tauri.localhost".parse().unwrap(),
            body: tauri::ipc::InvokeBody::Json(serde_json::json!({
              "patternId": patproj.id.to_string(),
              "filePath": file_path.to_str().unwrap(),
            })),
            headers: Default::default(),
            invoke_key: INVOKE_KEY.to_string(),
          },
        )
        .is_ok()
      );
      assert!(
        get_ipc_response(
          &webview,
          tauri::webview::InvokeRequest {
            cmd: "load_pattern".to_string(),
            callback: tauri::ipc::CallbackFn(0),
            error: tauri::ipc::CallbackFn(1),
            url: "http://tauri.localhost".parse().unwrap(),
            body: tauri::ipc::InvokeBody::Json(serde_json::json!({
              "patternId": patproj.id.to_string(),
            })),
            headers: Default::default(),
            invoke_key: INVOKE_KEY.to_string(),
          },
        )
        .is_ok()
      );
    }

    assert!(
      get_ipc_response(
        &webview,
        tauri::webview::InvokeRequest {
          cmd: "close_pattern".to_string(),
          callback: tauri::ipc::CallbackFn(0),
          error: tauri::ipc::CallbackFn(1),
          url: "http://tauri.localhost".parse().unwrap(),
          body: tauri::ipc::InvokeBody::Json(serde_json::json!({
            "patternId": patproj.id.to_string(),
          })),
          headers: Default::default(),
          invoke_key: INVOKE_KEY.to_string(),
        },
      )
      .is_ok()
    );
  }
}

#[test]
fn closes_pattern() {
  let app = setup_app::<MockRuntime>(mock_builder());
  let webview = tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
    .build()
    .unwrap();
  let patterns_state = app.handle().state::<PatternsState>();

  assert!(patterns_state.read().unwrap().is_empty());
  let tauri::ipc::InvokeResponseBody::Raw(body) = get_ipc_response(
    &webview,
    tauri::webview::InvokeRequest {
      cmd: "create_pattern".to_string(),
      callback: tauri::ipc::CallbackFn(0),
      error: tauri::ipc::CallbackFn(1),
      url: "http://tauri.localhost".parse().unwrap(),
      body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&Fabric::default()).unwrap()),
      headers: Default::default(),
      invoke_key: INVOKE_KEY.to_string(),
    },
  )
  .unwrap() else {
    panic!("Expected raw body in IPC response");
  };
  let patproj: PatternProject = borsh::from_slice(&body).unwrap();
  assert_eq!(patterns_state.read().unwrap().len(), 1);

  get_ipc_response(
    &webview,
    tauri::webview::InvokeRequest {
      cmd: "close_pattern".to_string(),
      callback: tauri::ipc::CallbackFn(0),
      error: tauri::ipc::CallbackFn(1),
      url: "http://tauri.localhost".parse().unwrap(),
      body: tauri::ipc::InvokeBody::Json(serde_json::json!({
        "patternId": patproj.id.to_string(),
      })),
      headers: Default::default(),
      invoke_key: INVOKE_KEY.to_string(),
    },
  )
  .unwrap();
  assert!(patterns_state.read().unwrap().is_empty());
}
