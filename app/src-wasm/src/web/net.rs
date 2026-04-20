use js_sys::Uint8Array;
use js_sys::futures::JsFuture;
use web_sys::{Request, RequestInit, Response};

use crate::error::Error;

pub async fn fetch(url: &str) -> Result<Vec<u8>, Error> {
  let window = web_sys::window().unwrap();

  let request = {
    let options = RequestInit::new();
    options.set_method("GET");

    Request::new_with_str_and_init(url, &options)?
  };

  let response = Response::from(JsFuture::from(window.fetch_with_request(&request)).await?);
  if !response.ok() {
    return Err(anyhow::anyhow!("HTTP {}: {url}", response.status()).into());
  }

  // Handle Vite SPA catch-all handler which returns the `index.html` file if the target URL doesn't exist.
  let content_type = response
    .headers()
    .get("Content-Type")
    .ok()
    .flatten()
    .unwrap_or_default();
  if content_type.starts_with("text/html") {
    return Err(anyhow::anyhow!("Unexpected HTML response for {url}").into());
  }

  let buffer = JsFuture::from(response.array_buffer()?).await?;
  Ok(Uint8Array::new(&buffer).to_vec())
}
