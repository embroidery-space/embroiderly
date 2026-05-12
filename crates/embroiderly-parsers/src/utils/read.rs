use std::io;

#[cfg(test)]
#[path = "read.test.rs"]
mod tests;

/// Provides additional methods for reading data in cross-stitch patterns.
pub trait ReadXspExt: io::Read + byteorder::ReadBytesExt {
  /// Reads a C-style string with a specified length.
  /// The string can be in UTF-8 or CP1251 encoding.
  fn read_cstring(&mut self, length: usize) -> io::Result<String> {
    let mut buf = vec![0; length + 1]; // +1 for the null terminator.
    self.read_exact(&mut buf)?;

    match std::ffi::CStr::from_bytes_until_nul(&buf) {
      Ok(cstr) => {
        let string = match cstr.to_str() {
          // The string is in UTF-8 (English).
          Ok(str) => String::from(str),

          // The string is in CP1251 (Russian).
          Err(_) => encoding_rs::WINDOWS_1251.decode(cstr.to_bytes()).0.to_string(),
        };

        Ok(string)
      }
      // This is an edge case when the string is full of trash data.
      Err(_) => Ok(String::new()),
    }
  }

  /// Reads a hex color as `String`.
  fn read_hex_color(&mut self) -> io::Result<String> {
    let mut buf: [u8; 3] = [0; 3];
    self.read_exact(&mut buf)?;
    Ok(hex::encode_upper(buf))
  }
}

/// All types that implement `Read` get methods defined in `ReadXspExt`.
impl<R: io::Read + ?Sized> ReadXspExt for R {}
