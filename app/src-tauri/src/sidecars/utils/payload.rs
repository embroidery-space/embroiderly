/// Adds a newline character to the end of the buffer if it doesn't already end with one.
pub fn with_newline(mut buffer: Vec<u8>) -> Vec<u8> {
  if buffer.last().is_some_and(|&byte| byte != b'\n') {
    buffer.push(b'\n');
  }
  buffer
}
