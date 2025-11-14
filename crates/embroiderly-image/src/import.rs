use std::collections::HashMap;
use std::str::FromStr as _;

use embroiderly_pattern::{
  BrandPaletteItem, Coord, Fabric, FullStitch, FullStitchKind, Palette, PaletteItem, Pattern, PatternInfo, Stitches,
};
use palette::color_difference::EuclideanDistance as _;
use palette::{Oklab, Srgb};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageImportOptions {
  /// The pattern size in stitches.
  pattern_size: (u16, u16),
  /// The number of colors in the palette.
  palette_size: usize,

  /// The image quantization options.
  quantization: QuantizationOptions,
  /// The image dithering options.
  dithering: Option<DitheringOptions>,
}

#[derive(Debug, Clone, Copy, PartialEq)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuantizationOptions {
  sampling_factor: f32,
}

impl From<QuantizationOptions> for quantette::QuantizeMethod {
  fn from(value: QuantizationOptions) -> Self {
    let kmeans_options = quantette::kmeans::KmeansOptions::new().sampling_factor(value.sampling_factor);
    quantette::QuantizeMethod::Kmeans(kmeans_options)
  }
}

#[derive(Debug, Clone, Copy, PartialEq)]
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DitheringOptions {
  error_diffusion: f32,
}

impl From<DitheringOptions> for quantette::dither::FloydSteinberg {
  fn from(value: DitheringOptions) -> Self {
    // Clamp the error diffusion value to the range `[0.0, 1.0]` to create the correct `FloydSteinberg` instance.
    let error_diffusion = value.error_diffusion.clamp(0.0, 1.0);
    quantette::dither::FloydSteinberg::with_error_diffusion(error_diffusion).unwrap()
  }
}

/// This function processes the provided image and converts it into the cross-stitch pattern with the specified target palette and options.
pub fn convert_image_into_pattern(
  image_path: std::path::PathBuf,
  target_palette: Vec<BrandPaletteItem>,
  options: ImageImportOptions,
) -> anyhow::Result<Pattern> {
  // Validate input parameters.
  let (width, height) = options.pattern_size;
  anyhow::ensure!(width > 0 && height > 0, "Pattern dimensions must be greater than 0.");

  let target_palette_size = target_palette.len();
  let palette_size = std::cmp::min(options.palette_size, target_palette_size);
  anyhow::ensure!(palette_size > 0, "Palette size must be greater than 0.");

  log::debug!("Loading the target image into memory.");
  let img = image::open(&image_path)?;

  log::debug!("Resizing the image to {width}x{height} dimensions.");
  let img = img.resize_exact(width as u32, height as u32, image::imageops::FilterType::Lanczos3);

  log::debug!("Quantizing image with palette size {palette_size}.",);
  let img = quantette::ImageBuf::try_from(img.to_rgb8())?;
  let img = quantette::Pipeline::new()
    .palette_size(quantette::PaletteSize::from_usize_clamped(palette_size))
    .quantize_method(options.quantization)
    .ditherer(options.dithering.map(|options| options.into()))
    .input_image(img.as_ref())
    .output_oklab_image();

  log::debug!("Processing the target palette.",);
  let Some(target_palette) = convert_palette_to_oklab(target_palette) else {
    anyhow::bail!("Failed to process target palette");
  };

  log::debug!("Converting image into pattern.");
  let pattern_title = image_path.file_stem().unwrap().to_string_lossy().to_string();
  let pattern = finalize_pattern(pattern_title, width, height, &img, &target_palette)?;

  Ok(pattern)
}

/// Converts a vector of `BrandPaletteItem` to a vector of `(Oklab, BrandPaletteItem)` tuples.
/// Returns `None`, if any color conversion fails.
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

/// Finalizes a pattern by mapping the image to the target palette and creating a pattern object.
fn finalize_pattern(
  title: String,
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
  for (x, y, pixel) in pixels.iter().cloned().enumerate().map(|(i, pixel)| {
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
    info: PatternInfo { title, ..Default::default() },
    fabric: Fabric {
      width,
      height,
      ..Fabric::default()
    },
    palette: {
      // Convert the palette and sort it for better visualization.
      let mut palette = Palette::from_iter(pattern_palette.into_iter().map(PaletteItem::from));
      palette.sort_by_brand_and_number();
      palette
    },
    fullstitches: Stitches::from_iter(fullstitches),
    ..Pattern::default()
  })
}
