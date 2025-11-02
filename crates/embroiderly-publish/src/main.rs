use argh::FromArgs;

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
  #[argh(option, default = "std::path::PathBuf::from(\"./resources/fonts/\")")]
  symbol_fonts_dir: std::path::PathBuf,
}

fn main() -> anyhow::Result<()> {
  embroiderly_publish::logger::init()?;
  let _telemetry = embroiderly_publish::telemetry::init()?;

  let args: Args = argh::from_env();

  let patproj = embroiderly_parsers::parse_pattern(args.pattern)?;
  embroiderly_publish::export_pattern(
    &patproj,
    args.output,
    serde_json::from_str(&args.options)?,
    args.symbol_fonts_dir,
  )?;

  Ok(())
}
