use argh::FromArgs;
use embroiderly_image::Error;

/// A utility program to import and convert images into embroidery patterns.
#[derive(FromArgs)]
struct Args {
  /// path to the input image file
  #[argh(option)]
  image: std::path::PathBuf,

  /// path to the output file
  #[argh(option)]
  output: std::path::PathBuf,

  /// path to the target brand palette
  #[argh(option)]
  palette: std::path::PathBuf,

  /// options for the import process in JSON format
  #[argh(option)]
  options: String,

  /// if specified, creates a preview of the pattern instead of converting the image into the patterm
  #[argh(switch)]
  preview: bool,
}

fn main() -> anyhow::Result<()> {
  embroiderly_image::logger::init()?;

  let Args {
    image,
    output,
    palette,
    options,
    preview,
  } = argh::from_env();

  let palette = serde_json::from_slice(&std::fs::read(palette)?).map_err(Error::InvalidPaletteFile)?;
  let options = serde_json::from_str(&options).map_err(Error::InvalidImageImportOptions)?;

  if preview {
    embroiderly_image::import::create_pattern_image_preview(image, output, palette, options)?;
  } else {
    todo!("Implement conversion logic")
  }

  // let pattern_path = image.with_extension(embroiderly_parsers::PatternFormat::default().to_string());
  // let pattern = embroiderly_image::import_image(image, palette, options)?;

  // let package_info = embroiderly_parsers::PackageInfo {
  //   name: String::from("Embroiderly Image Importer"),
  //   version: String::new(),
  // };

  // let patproj = embroiderly_pattern::PatternProject::new(pattern_path, pattern, Default::default(), Default::default());
  // embroiderly_parsers::save_pattern(&patproj, &package_info, None)?;

  Ok(())
}
