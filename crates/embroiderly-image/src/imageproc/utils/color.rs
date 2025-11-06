use std::str::FromStr as _;

use image::Rgb;
use palette::{IntoColor as _, Lab, Srgb};

/// Parses a hex color string (e.g., "#FF0000" or "FF0000") into a CIELAB color.
pub fn hex_to_lab(hex: &str) -> anyhow::Result<Lab> {
  let srgb: Srgb<f32> = Srgb::from_str(hex)?.into_format();
  Ok(srgb.into_color())
}

/// Converts an 8-bit sRGB color to the CIELAB color space.
pub fn rgb_to_lab(rgb: Rgb<u8>) -> Lab {
  let srgb: Srgb<f32> = Srgb::from(rgb.0).into_format();
  srgb.into_color()
}
