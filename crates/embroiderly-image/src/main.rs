use argh::FromArgs;
use embroiderly_image::commands;

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
struct ImportCommand {}

fn main() -> anyhow::Result<()> {
  logger::init()?;

  let args: Args = argh::from_env();
  match args.command {
    Command::Import(ImportCommand {}) => commands::import::run_image_import_server(),
  }
}
