use clap::Parser;

/// A utility program to import and convert images into embroidery patterns.
#[derive(Debug, Parser)]
struct Args {
  /// Path to the input image file
  #[arg(long)]
  image: std::path::PathBuf,

  /// Options for the import process in JSON format
  #[arg(long)]
  options: String,

  /// Path to the Embroiderly palettes directory
  #[arg(long, default_value = "./resources/palettes/")]
  palettes_dir: std::path::PathBuf,
}

fn main() -> anyhow::Result<()> {
  simple_logger::SimpleLogger::new()
    .with_level(log::LevelFilter::Debug)
    .init()?;

  let args = Args::parse();

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
