use clap::Parser;

/// A utility program to export embroidery patterns to various formats.
#[derive(Debug, Parser)]
#[command(about)]
struct Args {
  /// Path to the embroidery pattern file
  #[arg(short)]
  pattern_path: std::path::PathBuf,

  /// Path to the output file
  #[arg(short)]
  output_file: std::path::PathBuf,

  /// Path to the Embroiderly symbol fonts directory
  #[arg(long, default_value = "./resources/fonts/")]
  symbol_fonts_dir: std::path::PathBuf,
}

fn main() -> anyhow::Result<()> {
  let args = Args::parse();

  let patproj = embroiderly_parsers::parse_pattern(args.pattern_path)?;
  embroiderly_export::export_pattern(&patproj, args.output_file, args.symbol_fonts_dir)?;

  Ok(())
}
