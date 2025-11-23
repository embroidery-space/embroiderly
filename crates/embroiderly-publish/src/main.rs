use argh::FromArgs;
use embroiderly_publish::Error;

/// A utility program to export embroidery patterns to various formats.
#[derive(FromArgs)]
struct Args {
  /// path to the pattern file
  #[argh(option)]
  pattern: std::path::PathBuf,

  /// path to the output file
  #[argh(option)]
  output: std::path::PathBuf,

  /// options for the export process in JSON format
  #[argh(option)]
  options: String,

  /// path to the Embroiderly symbol fonts directory
  #[argh(option)]
  symbol_fonts_dir: Vec<std::path::PathBuf>,
}

fn main() -> anyhow::Result<()> {
  embroiderly_publish::logger::init()?;

  let Args {
    pattern,
    output,
    options,
    symbol_fonts_dir,
  } = argh::from_env();

  let patproj = embroiderly_parsers::parse_pattern(pattern)?;
  let options = serde_json::from_str(&options).map_err(Error::InvalidPdfExportOptions)?;

  embroiderly_publish::export_pattern(&patproj, output, options, symbol_fonts_dir)?;

  Ok(())
}
