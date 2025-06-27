use clap::Parser;

/// A utility program to export embroidery patterns to various formats.
#[derive(Debug, Parser)]
struct Args {
  /// Path to the pattern file
  #[arg(long)]
  pattern: std::path::PathBuf,

  /// Path to the output file
  #[arg(long)]
  output: std::path::PathBuf,

  /// Options for the export process in JSON format
  #[arg(long)]
  options: String,

  /// Path to the Embroiderly symbol fonts directory
  #[arg(long, default_value = "./resources/fonts/")]
  symbol_fonts_dir: std::path::PathBuf,
}

fn main() -> anyhow::Result<()> {
  simple_logger::SimpleLogger::new()
    .with_level(log::LevelFilter::Debug)
    .with_module_level("usvg::text::layout", log::LevelFilter::Error)
    .init()?;

  let args = Args::parse();

  let patproj = embroiderly_parsers::parse_pattern(args.pattern)?;
  embroiderly_publish::export_pattern(
    &patproj,
    args.output,
    serde_json::from_str(&args.options)?,
    args.symbol_fonts_dir,
  )?;

  Ok(())
}
