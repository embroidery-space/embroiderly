use std::collections::HashMap;
use std::str::FromStr as _;

use embroiderly_pattern::{
  BrandPaletteItem, Coord, EmbroiderlyProject, Fabric, FullStitch, FullStitchKind, Layer, Layers, Palette, PaletteItem,
  Pattern, Stitches,
};
use image::{DynamicImage, GenericImageView as _};
use palette::color_difference::EuclideanDistance as _;
use palette::{Oklab, Srgb};
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, PartialEq, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub struct ImageImportOptions {
  /// The pattern size in stitches.
  pub pattern_size: (u16, u16),
  /// The number of colors in the palette.
  pub palette_size: u32,
  /// The image quantization options.
  pub quantization: QuantizationOptions,
  /// The image dithering options.
  pub dithering: Option<DitheringOptions>,
}

#[derive(Debug, Clone, Copy, PartialEq, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub struct QuantizationOptions {
  pub sampling_factor: f32,
}

impl From<QuantizationOptions> for quantette::QuantizeMethod {
  fn from(value: QuantizationOptions) -> Self {
    let kmeans_options = quantette::kmeans::KmeansOptions::new().sampling_factor(value.sampling_factor);
    Self::Kmeans(kmeans_options)
  }
}

#[derive(Debug, Clone, Copy, PartialEq, borsh::BorshSerialize, borsh::BorshDeserialize)]
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

#[wasm_bindgen]
pub struct ImageDimensions {
  pub width: u32,
  pub height: u32,
}

#[wasm_bindgen]
pub struct ImageImportSession {
  image: DynamicImage,
  resized: HashMap<(u16, u16), DynamicImage>,
}

#[wasm_bindgen]
impl ImageImportSession {
  #[wasm_bindgen(constructor)]
  pub fn new(image_bytes: &[u8]) -> Result<Self, JsError> {
    let image = image::load_from_memory(image_bytes).map_err(to_js_error)?;
    Ok(Self {
      image,
      resized: HashMap::new(),
    })
  }

  #[must_use]
  #[wasm_bindgen(js_name = "imageDimensions")]
  pub fn image_dimensions(&self) -> ImageDimensions {
    ImageDimensions {
      width: self.image.width(),
      height: self.image.height(),
    }
  }

  #[wasm_bindgen(js_name = "getPreview")]
  pub fn get_preview(&mut self, palette_bytes: &[u8], options_bytes: &[u8]) -> Result<Vec<u8>, JsError> {
    let palette: Vec<BrandPaletteItem> = borsh::from_slice(palette_bytes).map_err(to_js_error)?;
    let options: ImageImportOptions = borsh::from_slice(options_bytes).map_err(to_js_error)?;

    let image = self.ensure_image(options.pattern_size);
    let palette = convert_palette_to_oklab(palette).ok_or_else(|| JsError::new("Failed to process target palette"))?;
    let pattern = convert_image_into_pattern(image, &palette, options).map_err(to_js_error)?;

    borsh::to_vec(&EmbroiderlyProject::new(pattern)).map_err(to_js_error)
  }
}

impl ImageImportSession {
  fn ensure_image(&mut self, dimensions: (u16, u16)) -> &DynamicImage {
    self.resized.entry(dimensions).or_insert_with(|| {
      let (width, height) = dimensions;
      self
        .image
        .resize_exact(width as u32, height as u32, image::imageops::FilterType::Lanczos3)
    })
  }
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

  let palette_size = usize::min(options.palette_size as usize, target_palette.len());
  anyhow::ensure!(palette_size > 0, "Palette size must be greater than 0.");

  let image = quantette::ImageBuf::try_from(image.to_rgb8())?;
  let image = quantette::Pipeline::new()
    .palette_size(quantette::PaletteSize::from_usize_clamped(palette_size))
    .quantize_method(options.quantization)
    .ditherer(options.dithering.map(std::convert::Into::into))
    .input_image(image.as_ref())
    .output_oklab_indexed_image();

  finalize_pattern(width, height, &image, target_palette)
}

/// Finalizes a pattern by mapping the image to the target palette and creating a pattern object.
fn finalize_pattern(
  width: u16,
  height: u16,
  image: &quantette::IndexedImage<Oklab>,
  target_palette: &[(Oklab, BrandPaletteItem)],
) -> anyhow::Result<Pattern> {
  // Resolve each quantized palette color to a brand palette item once.
  // Then collapse duplicates into the final pattern palette.
  let mut pattern_palette: Vec<BrandPaletteItem> = Vec::new();
  let mut palitem_to_palindex: HashMap<BrandPaletteItem, u32> = HashMap::new();
  let quant_to_palindex: Vec<u32> = image
    .palette()
    .iter()
    .map(|quant_color| {
      let (_best_color, best_palitem) = target_palette
        .iter()
        .min_by_key(|(palitem_color, _palitem)| {
          let dist_sq = quant_color.distance_squared(*palitem_color);
          // This unwrap is safe because `distance_squared` always returns valid floats.
          ordered_float::NotNan::new(dist_sq).unwrap()
        })
        // This unwrap is safe because the target palette is guaranteed to be non-empty.
        .unwrap();
      *palitem_to_palindex
        .entry(best_palitem.clone())
        .or_insert_with_key(|palitem| {
          let palindex = pattern_palette.len() as u32;
          pattern_palette.push(palitem.clone());
          palindex
        })
    })
    .collect();

  let width_usize = width as usize;
  let mut fullstitches: Vec<FullStitch> = Vec::with_capacity(image.indices().len());
  for (i, &qidx) in image.indices().iter().enumerate() {
    let x = i % width_usize;
    let y = i / width_usize;
    fullstitches.push(FullStitch {
      x: Coord::new(x as f32)?,
      y: Coord::new(y as f32)?,
      palindex: quant_to_palindex[qidx as usize],
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
    layers: Layers::new_with_layer(Layer {
      fullstitches: Stitches::from_iter(fullstitches),
      ..Layer::default()
    }),
    ..Pattern::default()
  })
}

fn to_js_error(error: impl std::fmt::Display) -> JsError {
  JsError::new(&error.to_string())
}
