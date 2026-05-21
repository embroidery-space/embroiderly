use gloo_net::http::Request;

use crate::Error;

pub async fn fetch(url: &str) -> Result<Vec<u8>, Error> {
  let response = Request::get(url).send().await?;
  if !response.ok() {
    return Err(Error::Net(anyhow::anyhow!("HTTP {}: {url}", response.status())));
  }

  // Vite's SPA catch-all returns `index.html` (200 OK) for unknown paths.
  let content_type = response.headers().get("Content-Type").unwrap_or_default();
  if content_type.starts_with("text/html") {
    return Err(Error::Net(anyhow::anyhow!("Unexpected HTML response for {url}")));
  }

  Ok(response.binary().await?)
}
