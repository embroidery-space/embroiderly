use base64::Engine as _;
use base64::engine::general_purpose::STANDARD;

pub fn encode<T: AsRef<[u8]>>(data: T) -> String {
  STANDARD.encode(data)
}

#[allow(dead_code)]
#[cfg(debug_assertions)]
pub fn decode<T: AsRef<[u8]>>(data: T) -> Result<Vec<u8>, base64::DecodeError> {
  STANDARD.decode(data)
}
