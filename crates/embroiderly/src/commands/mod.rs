pub mod display;
pub mod fabric;
pub mod fonts;
pub mod grid;
pub mod history;
pub mod image;
pub mod palette;
pub mod path;
pub mod pattern;
pub mod publish;
pub mod stitches;
pub mod system;

#[macro_export]
macro_rules! parse_command_payload {
  ($request:expr) => {{
    use $crate::error::CommandError;

    let Some(pattern_id) = $request.headers().get("patternId") else {
      return Err(CommandError::MissingPatternIdHeader.into());
    };
    let pattern_id = uuid::Uuid::parse_str(pattern_id.to_str().unwrap())?;
    (pattern_id,)
  }};
  ($request:expr, $data_type:ty) => {{
    use $crate::error::CommandError;

    let Some(pattern_id) = $request.headers().get("patternId") else {
      return Err(CommandError::MissingPatternIdHeader.into());
    };
    let pattern_id = uuid::Uuid::parse_str(pattern_id.to_str().unwrap())?;

    let tauri::ipc::InvokeBody::Raw(payload) = $request.body() else {
      return Err(CommandError::InvalidRequestBody.into());
    };
    let data = borsh::from_slice::<$data_type>(&payload)?;

    (pattern_id, data)
  }};
}
