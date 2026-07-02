#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum Error {
  #[cfg(feature = "idb")]
  #[error("IndexedDB operation failed: {0}")]
  Idb(#[source] anyhow::Error),

  #[cfg(feature = "net")]
  #[error("Network request failed: {0}")]
  Net(#[source] anyhow::Error),

  #[cfg(feature = "opfs")]
  #[error("OPFS operation failed: {0}")]
  Opfs(#[source] anyhow::Error),
}

#[cfg(feature = "idb")]
impl From<indexed_db::Error<anyhow::Error>> for Error {
  fn from(err: indexed_db::Error<anyhow::Error>) -> Self {
    Self::Idb(anyhow::anyhow!("{err}"))
  }
}

#[cfg(feature = "net")]
impl From<gloo_net::Error> for Error {
  fn from(err: gloo_net::Error) -> Self {
    Self::Net(anyhow::anyhow!("{err}"))
  }
}

#[cfg(feature = "__js")]
impl From<Error> for wasm_bindgen::JsValue {
  fn from(err: Error) -> Self {
    js_sys::Error::new(&err.to_string()).into()
  }
}

#[cfg(feature = "__js")]
pub fn js_to_anyhow(err: wasm_bindgen::JsValue) -> anyhow::Error {
  use wasm_bindgen::convert::TryFromJsValue as _;

  let msg = if let Some(js_err) = js_sys::Error::try_from_js_value_ref(&err) {
    format!("{}: {}", String::from(js_err.name()), String::from(js_err.message()))
  } else if let Some(s) = err.as_string() {
    s
  } else {
    format!("{err:?}")
  };

  anyhow::anyhow!(msg)
}
