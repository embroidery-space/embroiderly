/// Simplifies executing Tauri IPC commands in tests.
///
/// Usage:
///
/// ```rust
/// invoke_ipc!(
///   &webview,
///   cmd: "update_fabric",
///   body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&new_fabric).unwrap()),
///   headers: [("patternId", pattern_id.to_string().parse().unwrap())]
/// )
/// ```
///
/// Or without headers:
///
/// ```rust
/// invoke_ipc!(
///   &webview,
///   cmd: "update_fabric",
///   body: tauri::ipc::InvokeBody::Raw(borsh::to_vec(&new_fabric).unwrap())
/// )
/// ```
#[macro_export]
macro_rules! invoke_ipc {
  ($webview:expr, cmd: $cmd:expr, body: $body:expr) => {{
    use tauri::test::{get_ipc_response, INVOKE_KEY};
    get_ipc_response(
      $webview,
      tauri::webview::InvokeRequest {
        cmd: $cmd.to_string(),
        callback: tauri::ipc::CallbackFn(0),
        error: tauri::ipc::CallbackFn(1),
        url: "http://tauri.localhost".parse().unwrap(),
        body: $body,
        headers: Default::default(),
        invoke_key: INVOKE_KEY.to_string(),
      },
    )
  }};
  ($webview:expr, cmd: $cmd:expr, body: $body:expr, headers: [$(($header_key:expr, $header_value:expr)),* $(,)?]) => {{
    use tauri::test::{get_ipc_response, INVOKE_KEY};
    get_ipc_response(
      $webview,
      tauri::webview::InvokeRequest {
        cmd: $cmd.to_string(),
        callback: tauri::ipc::CallbackFn(0),
        error: tauri::ipc::CallbackFn(1),
        url: "http://tauri.localhost".parse().unwrap(),
        body: $body,
        headers: {
          let mut headers = tauri::http::HeaderMap::new();
          $(headers.insert($header_key, $header_value);)*
          headers
        },
        invoke_key: INVOKE_KEY.to_string(),
      },
    )
  }};
}
