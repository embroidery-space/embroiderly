use std::io::Write as _;

use argh::FromArgs;
use embroiderly_image::Error;

mod logger;

/// A utility program to import and convert images into embroidery patterns.
#[derive(FromArgs)]
struct Args {
  /// path to the input image file
  #[argh(option)]
  image: std::path::PathBuf,

  /// path to the target brand palette
  #[argh(option)]
  palette: std::path::PathBuf,

  /// options for the import process in JSON format
  #[argh(option)]
  options: String,
}

fn main() -> anyhow::Result<()> {
  logger::init()?;

  let Args { image, palette, options } = argh::from_env();
  let pattern_path = image.with_extension(embroiderly_parsers::PatternFormat::default().to_string());

  let palette = serde_json::from_slice(&std::fs::read(palette)?).map_err(Error::InvalidPaletteFile)?;
  let options = serde_json::from_str(&options).map_err(Error::InvalidImageImportOptions)?;

  let pattern = embroiderly_image::convert_image_into_pattern(image, palette, options)?;
  let patproj = embroiderly_pattern::PatternProject::new(pattern_path, pattern, Default::default(), Default::default());

  std::io::stdout().write_all(&borsh::to_vec(&patproj)?)?;
  std::io::stdout().flush()?;

  Ok(())
}
