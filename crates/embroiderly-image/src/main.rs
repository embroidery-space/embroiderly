use argh::FromArgs;

mod commands;
mod logger;

/// A utility program for image operations in embroidery patterns.
#[derive(FromArgs)]
struct Args {
  #[argh(subcommand)]
  command: Command,
}

#[derive(FromArgs)]
#[argh(subcommand)]
enum Command {
  Import(ImportCommand),
}

/// Import and convert images into embroidery patterns.
#[derive(FromArgs)]
#[argh(subcommand, name = "import")]
struct ImportCommand {
  /// path to the source image file
  #[argh(option)]
  image: std::path::PathBuf,
}

fn main() -> anyhow::Result<()> {
  logger::init()?;

  let args: Args = argh::from_env();
  match args.command {
    Command::Import(ImportCommand { image }) => commands::import::run_import_server(image),
  }
}
