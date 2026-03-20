pub mod display;
pub mod fabric;
pub mod grid;
pub mod history;
pub mod image;
pub mod layers;
pub mod palette;
pub mod pattern;
pub mod publish;
pub mod stitches;

#[macro_export]
macro_rules! parse_command_payload {
  ($request:expr) => {{
    use $crate::error::{Error, ErrorKind};

    let Some(pattern_id) = $request.headers().get("patternId") else {
      return Err(Error::new(ErrorKind::MissingPatternIdHeader));
    };
    let pattern_id = uuid::Uuid::parse_str(pattern_id.to_str().unwrap())?;

    tracing::Span::current().record("pattern_id", &tracing::field::debug(&pattern_id));

    (pattern_id,)
  }};
  ($request:expr, $data_type:ty) => {{
    use $crate::error::{Error, ErrorKind};

    let Some(pattern_id) = $request.headers().get("patternId") else {
      return Err(Error::new(ErrorKind::MissingPatternIdHeader));
    };
    let pattern_id = uuid::Uuid::parse_str(pattern_id.to_str().unwrap())?;

    let tauri::ipc::InvokeBody::Raw(body) = $request.body() else {
      return Err(Error::new(ErrorKind::InvalidRequestBody));
    };
    let body = borsh::from_slice::<$data_type>(&body)?;

    tracing::Span::current().record("pattern_id", &tracing::field::debug(&pattern_id));
    tracing::Span::current().record("body", &tracing::field::debug(&body));

    (pattern_id, body)
  }};
}
