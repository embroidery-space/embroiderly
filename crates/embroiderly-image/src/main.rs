use argh::FromArgs;

/// A utility program to import and convert images into embroidery patterns.
#[derive(FromArgs)]
struct Args {
  /// path to the input image file
  #[argh(option)]
  image: std::path::PathBuf,

  /// options for the import process in JSON format
  #[argh(option)]
  options: String,

  /// path to the Embroiderly palettes directory
  #[argh(option, default = "std::path::PathBuf::from(\"./resources/palettes/\")")]
  palettes_dir: std::path::PathBuf,
}

fn main() -> anyhow::Result<()> {
  embroiderly_image::logger::init()?;
  let _telemetry = embroiderly_image::telemetry::init()?;

  let args: Args = argh::from_env();

  let pattern_path = args
    .image
    .with_extension(embroiderly_parsers::PatternFormat::default().to_string());
  let pattern = embroiderly_image::import_image(args.image, args.palettes_dir, serde_json::from_str(&args.options)?)?;

  let package_info = embroiderly_parsers::PackageInfo {
    name: String::from("Embroiderly Image Importer"),
    version: String::new(),
  };

  let patproj = embroiderly_pattern::PatternProject::new(pattern_path, pattern, Default::default(), Default::default());
  embroiderly_parsers::save_pattern(&patproj, &package_info, None)?;

  Ok(())
}
