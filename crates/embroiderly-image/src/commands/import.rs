use std::collections::HashMap;
use std::io::{BufRead as _, Write as _};
use std::path::PathBuf;
use std::str::FromStr as _;

use embroiderly_pattern::{
  BrandPaletteItem, Coord, Fabric, FullStitch, FullStitchKind, Palette, PaletteItem, Pattern, Stitches,
};
use image::{DynamicImage, GenericImageView as _};
use palette::color_difference::EuclideanDistance as _;
use palette::{Oklab, Srgb};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageImportOptions {
  /// The pattern size in stitches.
  pub pattern_size: (u16, u16),
  /// The number of colors in the palette.
  pub palette_size: usize,

  /// The image quantization options.
  pub quantization: QuantizationOptions,
  /// The image dithering options.
  pub dithering: Option<DitheringOptions>,
}

#[derive(Debug, Clone, Copy, PartialEq)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuantizationOptions {
  pub sampling_factor: f32,
}

impl From<QuantizationOptions> for quantette::QuantizeMethod {
  fn from(value: QuantizationOptions) -> Self {
    let kmeans_options = quantette::kmeans::KmeansOptions::new().sampling_factor(value.sampling_factor);
    Self::Kmeans(kmeans_options)
  }
}

#[derive(Debug, Clone, Copy, PartialEq)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DitheringOptions {
  pub error_diffusion: f32,
}

#[expect(clippy::fallible_impl_from)]
impl From<DitheringOptions> for quantette::dither::FloydSteinberg {
  fn from(value: DitheringOptions) -> Self {
    // Clamp the error diffusion value to the range `[0.0, 1.0]` to create the correct `FloydSteinberg` instance.
    let error_diffusion = value.error_diffusion.clamp(0.0, 1.0);
    Self::with_error_diffusion(error_diffusion).unwrap()
  }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ImageImportServerCommand {
  /// Get an updated image import preview with the specified options.
  Update {
    image_path: PathBuf,
    palette_path: PathBuf,
    options: ImageImportOptions,
  },
  /// Shutdown the image import server.
  Shutdown,
}

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
    tracing::debug!("Loading the original image into memory.");
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

      tracing::debug!("Resizing image to {width}x{height} dimensions.");
      let image = self
        .image
        .resize_exact(width as u32, height as u32, image::imageops::FilterType::Lanczos3);

      self.preprocessed_images.insert(dimensions, image);
    }
  }

  fn ensure_palette(&mut self, palette_path: &PathBuf) -> anyhow::Result<()> {
    if !self.preprocessed_palettes.contains_key(palette_path) {
      tracing::debug!("Loading and preprocessing palette.");
      let palette = serde_json::from_slice(&std::fs::read(palette_path)?)?;
      let palette =
        convert_palette_to_oklab(palette).ok_or_else(|| anyhow::anyhow!("Failed to process target palette"))?;
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

/// Runs the long-lived import server that processes commands from stdin.
pub fn run_image_import_server() -> anyhow::Result<()> {
  tracing::info!("Embroiderly image import sidecar started");
  let mut state: Option<ImageImportState> = None;

  // Read incoming options updates from stdin line by line.
  let mut stdin = std::io::stdin().lock();
  loop {
    let mut line = String::new();

    let bytes_read = stdin.read_line(&mut line)?;
    if bytes_read == 0 {
      tracing::trace!("EOF reached, shutting down sidecar");
      break;
    }

    let command: ImageImportServerCommand = serde_json::from_str(&line)?;
    match command {
      ImageImportServerCommand::Update {
        image_path,
        palette_path,
        options,
      } => {
        let _guard = tracing::trace_span!("update_command", ?image_path, ?palette_path, ?options).entered();

        // Initialize or replace the state if it's None or the image path has changed.
        if state.as_ref().is_none_or(|s| s.image_path != image_path) {
          state = Some(ImageImportState::new(image_path.clone())?);
        }

        let (image, palette) = {
          let state = state.as_mut().unwrap();
          state.ensure_image(options.pattern_size);
          state.ensure_palette(&palette_path)?;

          state.get_image_and_palette(options.pattern_size, &palette_path)
        };

        let patproj = {
          let mut pattern = convert_image_into_pattern(image, palette, options)?;

          // Set the title if the image path has a file stem.
          if let Some(file_stem) = image_path.file_stem() {
            pattern.info.title = file_stem.to_string_lossy().to_string();
          }

          embroiderly_pattern::PatternProject::new(pattern)
        };

        send_pattern_response(patproj)?;
      }
      ImageImportServerCommand::Shutdown => {
        tracing::trace!("Shutdown command received, terminating the process");
        break;
      }
    }
  }

  tracing::info!("Embroiderly image import sidecar terminated");
  Ok(())
}

/// Converts a vector of `BrandPaletteItem` to a vector of `(Oklab, BrandPaletteItem)` tuples.
/// Returns `None`, if any color conversion fails.
#[must_use]
fn convert_palette_to_oklab(palette: Vec<BrandPaletteItem>) -> Option<Vec<(Oklab, BrandPaletteItem)>> {
  let thread_colors = palette
    .iter()
    .filter_map(|palitem| Srgb::from_str(&palitem.color).ok())
    .collect::<Vec<Srgb<u8>>>();
  if thread_colors.len() != palette.len() {
    return None;
  }

  let oklab_colors = quantette::color_space::srgb8_to_oklab(&thread_colors);
  Some(oklab_colors.into_iter().zip(palette).collect())
}

/// This function processes the provided image and converts it into the cross-stitch pattern with the specified target palette and options.
fn convert_image_into_pattern(
  image: &DynamicImage,
  target_palette: &[(Oklab, BrandPaletteItem)],
  options: ImageImportOptions,
) -> anyhow::Result<Pattern> {
  // Validate input parameters.
  let (width, height) = options.pattern_size;
  anyhow::ensure!(width > 0 && height > 0, "Pattern dimensions must be greater than 0.");
  anyhow::ensure!(
    image.dimensions() == (width as u32, height as u32),
    "The image must be resized to the specified dimensions."
  );

  let palette_size = std::cmp::min(options.palette_size, target_palette.len());
  anyhow::ensure!(palette_size > 0, "Palette size must be greater than 0.");

  tracing::trace!("Quantizing image with palette size {palette_size}.",);
  let image = quantette::ImageBuf::try_from(image.to_rgb8())?;
  let image = quantette::Pipeline::new()
    .palette_size(quantette::PaletteSize::from_usize_clamped(palette_size))
    .quantize_method(options.quantization)
    .ditherer(options.dithering.map(std::convert::Into::into))
    .input_image(image.as_ref())
    .output_oklab_image();

  tracing::trace!("Converting image into pattern.");
  let pattern = finalize_pattern(width, height, &image, target_palette)?;

  Ok(pattern)
}

/// Finalizes a pattern by mapping the image to the target palette and creating a pattern object.
fn finalize_pattern(
  width: u16,
  height: u16,
  image: &quantette::ImageBuf<Oklab>,
  target_palette: &[(Oklab, BrandPaletteItem)],
) -> anyhow::Result<Pattern> {
  // We can't store plain Oklab value in the hashmap as it contains `f32` which doesn't implement `Eq`.
  // So we convert the underlying `f32` values to their `u32` representation for hashing.
  type OklabKey = (u32, u32, u32);
  fn oklab_to_key(color: Oklab) -> OklabKey {
    let (l, a, b) = color.into_components();
    (l.to_bits(), a.to_bits(), b.to_bits())
  }

  let pixels = image.as_slice();

  // Initialize collections.
  let mut pattern_palette: Vec<BrandPaletteItem> = Vec::new();
  let mut fullstitches: Vec<FullStitch> = Vec::with_capacity(pixels.len());

  // Initialize caches.
  let mut pixel_to_palitem: HashMap<OklabKey, BrandPaletteItem> = HashMap::new();
  let mut palitem_to_palindex: HashMap<BrandPaletteItem, usize> = HashMap::new();

  let width_usize = width as usize;
  for (x, y, pixel) in pixels.iter().copied().enumerate().map(|(i, pixel)| {
    let x = i % width_usize;
    let y = i / width_usize;
    (x, y, pixel)
  }) {
    let palitem = pixel_to_palitem
      .entry(oklab_to_key(pixel))
      .or_insert_with(|| {
        let (_best_color, best_palitem) = target_palette
          .iter()
          .min_by_key(|(palitem_color, _palitem)| {
            let dist_sq = pixel.distance_squared(*palitem_color);
            ordered_float::NotNan::new(dist_sq).unwrap() // This unwrap is safe because `distance_squared` always returns valid floats.
          })
          .unwrap(); // This unwrap is safe because the target palette is guaranteed to be non-empty.
        best_palitem.clone()
      })
      .clone();

    let palindex = *palitem_to_palindex.entry(palitem).or_insert_with_key(|palitem| {
      let palindex = pattern_palette.len();
      pattern_palette.push(palitem.clone());
      palindex
    });

    fullstitches.push(FullStitch {
      x: Coord::new(x as f32)?,
      y: Coord::new(y as f32)?,
      palindex: palindex as u32,
      kind: FullStitchKind::Full,
    });
  }

  Ok(Pattern {
    fabric: Fabric {
      width,
      height,
      ..Fabric::default()
    },
    palette: {
      // Convert the palette and sort it for better visualization.
      let mut palette: Palette = pattern_palette.into_iter().map(PaletteItem::from).collect();
      palette.sort_by_brand_and_number();
      palette
    },
    fullstitches: Stitches::from_iter(fullstitches),
    ..Pattern::default()
  })
}

/// Sends a pattern response with length prefix via stdout.
fn send_pattern_response(patproj: embroiderly_pattern::PatternProject) -> anyhow::Result<()> {
  let buffer = borsh::to_vec(&patproj)?;
  let buffer_len = buffer.len() as u64;

  let mut stdout = std::io::stdout().lock();
  stdout.write_all(&buffer_len.to_le_bytes())?;
  stdout.write_all(&buffer)?;
  stdout.flush()?;

  tracing::trace!("Sent pattern response ({buffer_len} bytes)");
  Ok(())
}
