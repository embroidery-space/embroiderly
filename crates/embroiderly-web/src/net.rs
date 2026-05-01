use js_sys::Uint8Array;
use js_sys::futures::JsFuture;
use web_sys::{Request, RequestInit, Response};

use crate::Error;
use crate::error::js_to_anyhow;

fn net_err(e: wasm_bindgen::JsValue) -> Error {
  Error::Net(js_to_anyhow(e))
}

pub async fn fetch(url: &str) -> Result<Vec<u8>, Error> {
  let window = web_sys::window().unwrap();

  let request = {
    let options = RequestInit::new();
    options.set_method("GET");
    Request::new_with_str_and_init(url, &options).map_err(net_err)?
  };

  let response = Response::from(
    JsFuture::from(window.fetch_with_request(&request))
      .await
      .map_err(net_err)?,
  );
  if !response.ok() {
    return Err(Error::Net(anyhow::anyhow!("HTTP {}: {url}", response.status())));
  }

  // Handle Vite SPA catch-all handler which returns the `index.html` file if the target URL doesn't exist.
  let content_type = response
    .headers()
    .get("Content-Type")
    .ok()
    .flatten()
    .unwrap_or_default();
  if content_type.starts_with("text/html") {
    return Err(Error::Net(anyhow::anyhow!("Unexpected HTML response for {url}")));
  }

  let buffer = JsFuture::from(response.array_buffer().map_err(net_err)?)
    .await
    .map_err(net_err)?;
  Ok(Uint8Array::new(&buffer).to_vec())
}
