use std::collections::HashMap;
use std::io::{BufRead as _, Write as _};
use std::path::PathBuf;

use embroiderly_pattern::BrandPaletteItem;
use image::DynamicImage;
use palette::Oklab;
use serde::{Deserialize, Serialize};

/// State for caching processed resources during image import.
struct ImageImportState {
  /// The original loaded image.
  image: DynamicImage,
  /// The path to the original image file.
  image_path: PathBuf,
  /// Cache of resized images keyed by dimensions (width, height).
  preprocessed_images: HashMap<(u16, u16), DynamicImage>,
  /// Cache of preprocessed palettes keyed by palette file path.
  preprocessed_palettes: HashMap<PathBuf, Vec<(Oklab, BrandPaletteItem)>>,
}

impl ImageImportState {
  /// Create a new state by loading the image from the given path.
  fn new(image_path: PathBuf) -> anyhow::Result<Self> {
    log::debug!("Loading the original image into memory.");
    let image = image::open(&image_path)?;

    Ok(Self {
      image,
      image_path,
      preprocessed_images: HashMap::new(),
      preprocessed_palettes: HashMap::new(),
    })
  }

  fn ensure_image(&mut self, dimensions: (u16, u16)) {
    if !self.preprocessed_images.contains_key(&dimensions) {
      let (width, height) = dimensions;

      log::debug!("Resizing image to {width}x{height} dimensions.");
      let image = self
        .image
        .resize_exact(width as u32, height as u32, image::imageops::FilterType::Lanczos3);

      self.preprocessed_images.insert(dimensions, image);
    }
  }

  fn ensure_palette(&mut self, palette_path: &PathBuf) -> anyhow::Result<()> {
    if !self.preprocessed_palettes.contains_key(palette_path) {
      log::debug!("Loading and preprocessing palette.");
      let palette = serde_json::from_slice(&std::fs::read(palette_path)?)?;
      let palette = embroiderly_image::convert_palette_to_oklab(palette)
        .ok_or_else(|| anyhow::anyhow!("Failed to process target palette"))?;
      self.preprocessed_palettes.insert(palette_path.clone(), palette);
    }
    Ok(())
  }

  pub fn get_image_and_palette(
    &self,
    dimensions: (u16, u16),
    palette_path: &PathBuf,
  ) -> (&DynamicImage, &[(Oklab, BrandPaletteItem)]) {
    (
      self.preprocessed_images.get(&dimensions).unwrap(),
      self.preprocessed_palettes.get(palette_path).unwrap(),
    )
  }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ImageImportUpdate {
  image_path: PathBuf,
  palette_path: PathBuf,
  options: embroiderly_image::ImageImportOptions,
}

/// Runs the long-lived import server that processes commands from stdin.
pub fn run_import_server(image_path: PathBuf) -> anyhow::Result<()> {
  log::info!("Embroiderly image import sidecar started");
  let mut state = ImageImportState::new(image_path)?;

  // Read incoming options updates from stdin line by line.
  let mut stdin = std::io::stdin().lock();
  loop {
    let mut line = String::new();

    let bytes_read = stdin.read_line(&mut line)?;
    if bytes_read == 0 {
      log::info!("EOF reached, shutting down sidecar");
      break;
    }

    let ImageImportUpdate {
      image_path,
      palette_path,
      options,
    } = serde_json::from_str(&line)?;

    // Replace the state if the target image path has changed.
    if state.image_path != image_path {
      state = ImageImportState::new(image_path.clone())?;
    }

    let (image, palette) = {
      state.ensure_image(options.pattern_size);
      state.ensure_palette(&palette_path)?;

      state.get_image_and_palette(options.pattern_size, &palette_path)
    };

    let patproj = {
      let mut pattern = embroiderly_image::convert_image_into_pattern(image, palette, options)?;

      // Set the title if the image path has a file stem.
      if let Some(file_stem) = image_path.file_stem() {
        pattern.info.title = file_stem.to_string_lossy().to_string();
      }

      let pattern_path = image_path.with_extension(embroiderly_parsers::PatternFormat::default().to_string());
      embroiderly_pattern::PatternProject::new(pattern_path, pattern, Default::default(), Default::default())
    };

    send_pattern_response(patproj)?
  }

  log::info!("Embroiderly image import sidecar terminated");
  Ok(())
}

/// Sends a pattern response with length prefix via stdout.
fn send_pattern_response(patproj: embroiderly_pattern::PatternProject) -> anyhow::Result<()> {
  let buffer = borsh::to_vec(&patproj)?;
  let buffer_len = buffer.len() as u64;

  let mut stdout = std::io::stdout().lock();
  stdout.write_all(&buffer_len.to_le_bytes())?;
  stdout.write_all(&buffer)?;
  stdout.flush()?;

  log::debug!("Sent pattern response ({buffer_len} bytes)");
  Ok(())
}
