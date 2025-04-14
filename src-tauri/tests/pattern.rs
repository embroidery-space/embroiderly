use embroiderly::state::{PatternKey, PatternsState};
use embroiderly::{Fabric, setup_app};
use tauri::Manager;
use tauri::http::{HeaderMap, HeaderValue};
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

    assert!(
      get_ipc_response(
        &webview,
        tauri::webview::InvokeRequest {
          cmd: "load_pattern".to_string(),
          callback: tauri::ipc::CallbackFn(0),
          error: tauri::ipc::CallbackFn(1),
          url: "http://tauri.localhost".parse().unwrap(),
          body: tauri::ipc::InvokeBody::default(),
          headers: {
            let mut headers = HeaderMap::new();
            headers.insert("filePath", HeaderValue::from_str(file_path.to_str().unwrap()).unwrap());
            headers
          },
          invoke_key: INVOKE_KEY.to_string(),
        },
      )
      .is_ok()
    );
    assert!(
      patterns_state
        .read()
        .unwrap()
        .contains_key(&PatternKey::from(&file_path))
    );
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
        headers: HeaderMap::default(),
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
    assert!(
      get_ipc_response(
        &webview,
        tauri::webview::InvokeRequest {
          cmd: "load_pattern".to_string(),
          callback: tauri::ipc::CallbackFn(0),
          error: tauri::ipc::CallbackFn(1),
          url: "http://tauri.localhost".parse().unwrap(),
          body: tauri::ipc::InvokeBody::default(),
          headers: {
            let mut headers = HeaderMap::new();
            headers.insert("filePath", HeaderValue::from_str(file_path.to_str().unwrap()).unwrap());
            headers
          },
          invoke_key: INVOKE_KEY.to_string(),
        },
      )
      .is_ok()
    );

    let pattern_key = PatternKey::from(&file_path);
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
            body: tauri::ipc::InvokeBody::default(),
            headers: {
              let mut headers = HeaderMap::new();
              headers.insert("patternKey", HeaderValue::from_str(pattern_key.as_ref()).unwrap());
              headers.insert("filePath", HeaderValue::from_str(file_path.to_str().unwrap()).unwrap());
              headers
            },
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
            body: tauri::ipc::InvokeBody::default(),
            headers: {
              let mut headers = HeaderMap::new();
              headers.insert("filePath", HeaderValue::from_str(file_path.to_str().unwrap()).unwrap());
              headers
            },
            invoke_key: INVOKE_KEY.to_string(),
          },
        )
        .is_ok()
      );
    }
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
  assert!(
    get_ipc_response(
      &webview,
      tauri::webview::InvokeRequest {
        cmd: "create_pattern".to_string(),
        callback: tauri::ipc::CallbackFn(0),
        error: tauri::ipc::CallbackFn(1),
        url: "http://tauri.localhost".parse().unwrap(),
        body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&Fabric::default()).unwrap()),
        headers: HeaderMap::default(),
        invoke_key: INVOKE_KEY.to_string(),
      },
    )
    .is_ok()
  );
  assert_eq!(patterns_state.read().unwrap().len(), 1);

  let pattern_key = patterns_state
    .read()
    .unwrap()
    .keys()
    .cloned()
    .collect::<Vec<PatternKey>>()
    .first()
    .unwrap()
    .to_owned();
  assert!(
    get_ipc_response(
      &webview,
      tauri::webview::InvokeRequest {
        cmd: "close_pattern".to_string(),
        callback: tauri::ipc::CallbackFn(0),
        error: tauri::ipc::CallbackFn(1),
        url: "http://tauri.localhost".parse().unwrap(),
        body: tauri::ipc::InvokeBody::default(),
        headers: {
          let mut headers = HeaderMap::new();
          headers.insert("patternKey", HeaderValue::from_str(pattern_key.as_ref()).unwrap());
          headers
        },
        invoke_key: INVOKE_KEY.to_string(),
      },
    )
    .is_ok()
  );
  assert!(patterns_state.read().unwrap().is_empty());
}
