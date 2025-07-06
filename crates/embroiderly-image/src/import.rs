use std::str::FromStr as _;

use embroiderly_pattern::*;
use palette::FromColor as _;
use palette::color_difference::Ciede2000 as _;
use rayon::prelude::*;

const PYRAMID_LEVELS: usize = 3;
const PYRAMID_BLURRING_ALGORITHM: image::imageops::FilterType = image::imageops::FilterType::Gaussian;

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageImportOptions {
  pattern_size: (u16, u16),
  palette: String,
  palette_size: u16,
}

pub fn import_image<P: AsRef<std::path::Path>>(
  image_path: P,
  palettes_dir: P,
  options: ImageImportOptions,
) -> anyhow::Result<Pattern> {
  let image_path = image_path.as_ref();
  let palettes_dir = palettes_dir.as_ref();

  let (width, height) = options.pattern_size;

  let img = {
    // Open the image file and convert it to RGB8 format.
    let img = image::open(image_path)?.to_rgb8();

    // Decrease the palette size.
    let quantized = quantette::ImagePipeline::try_from(&img)?
      .palette_size(quantette::PaletteSize::from_clamped(options.palette_size))
      .colorspace(quantette::ColorSpace::Oklab)
      .quantize_method(quantette::QuantizeMethod::kmeans())
      .quantized_rgbimage_par();

    // Resize the image to the specified dimensions using the Nearest Neighbor filter.
    image::DynamicImage::ImageRgb8(quantized)
      .resize_exact(width as u32, height as u32, image::imageops::FilterType::Nearest)
      .to_rgb32f()
  };

  let gaussian_pyramid = generate_gaussian_pyramid(img, PYRAMID_LEVELS);
  let laplacian_pyramid = generate_laplacian_pyramid(&gaussian_pyramid);
  debug_assert!(gaussian_pyramid.len() == laplacian_pyramid.len());

  let pattern_image = reconstruct_image(&laplacian_pyramid);
  let target_palette: Vec<PaletteItem> = {
    let palette_path = palettes_dir.join(format!("{}.json", options.palette));
    let content = std::fs::read_to_string(palette_path)?;
    serde_json::from_str(&content)?
  };

  convert_image_into_pattern(pattern_image, width, height, &target_palette)
}

/// Creates a Gaussian pyramid from an image.
fn generate_gaussian_pyramid(image: image::Rgb32FImage, levels: usize) -> Vec<image::Rgb32FImage> {
  let mut pyramid = Vec::with_capacity(levels);
  pyramid.push(image);

  for i in 1..levels {
    let prev = &pyramid[i - 1];
    let downsampled = image::imageops::resize(prev, prev.width() / 2, prev.height() / 2, PYRAMID_BLURRING_ALGORITHM);
    pyramid.push(downsampled);
  }

  pyramid
}

/// Creates a Laplacian pyramid from a Gaussian pyramid that contains only image differences.
pub fn generate_laplacian_pyramid(gaussian_pyramid: &[image::Rgb32FImage]) -> Vec<image::Rgb32FImage> {
  let levels = gaussian_pyramid.len();
  if levels == 0 {
    return Vec::new();
  }

  // Calculate difference images in parallel for all but the last level.
  let mut pyramid: Vec<_> = (0..levels - 1)
    .into_par_iter()
    .map(|i| {
      let current_level = &gaussian_pyramid[i];
      let next_level = &gaussian_pyramid[i + 1];

      let (target_width, target_height) = current_level.dimensions();

      let upsampled = image::imageops::resize(next_level, target_width, target_height, PYRAMID_BLURRING_ALGORITHM);

      let mut difference = image::ImageBuffer::new(target_width, target_height);
      difference.enumerate_rows_mut().par_bridge().for_each(|(_y, row)| {
        for (x, y, pixel) in row {
          let current_pixel = current_level.get_pixel(x, y);
          let upsampled_pixel = upsampled.get_pixel(x, y);

          let r = current_pixel[0] - upsampled_pixel[0];
          let g = current_pixel[1] - upsampled_pixel[1];
          let b = current_pixel[2] - upsampled_pixel[2];

          *pixel = image::Rgb([r, g, b]);
        }
      });

      difference
    })
    .collect();

  // The last level of the Laplacian pyramid is the smallest image from the Gaussian pyramid.
  let last_gaussian_level = &gaussian_pyramid[levels - 1];
  pyramid.push(last_gaussian_level.clone());

  pyramid
}

/// Reconstructs the image from a Laplacian pyramid.
pub fn reconstruct_image(laplacian_pyramid: &[image::Rgb32FImage]) -> image::RgbImage {
  let levels = laplacian_pyramid.len();
  if levels == 0 {
    return image::RgbImage::new(0, 0);
  }

  // Start with the last level of the Laplacian pyramid, which is the smallest image (not a diff).
  let mut final_image = laplacian_pyramid[levels - 1].clone();

  // Iterate through the Laplacian pyramid in reverse order, starting from the second last level.
  for i in (0..=levels - 2).rev() {
    let (target_width, target_height) = laplacian_pyramid[i].dimensions();

    // Upsample the current image to the target dimensions.
    let upsampled = image::imageops::resize(
      &final_image,
      target_width,
      target_height,
      image::imageops::FilterType::Gaussian,
    );

    let mut next_image = image::ImageBuffer::new(target_width, target_height);
    let laplacian_level = &laplacian_pyramid[i];

    // Combine the upsampled image with the Laplacian level.
    next_image
      .par_chunks_mut(3)
      .zip(upsampled.par_pixels())
      .zip(laplacian_level.par_pixels())
      .for_each(|((pixel_chunk, upsampled_pixel), laplacian_pixel)| {
        pixel_chunk[0] = upsampled_pixel[0] + laplacian_pixel[0];
        pixel_chunk[1] = upsampled_pixel[1] + laplacian_pixel[1];
        pixel_chunk[2] = upsampled_pixel[2] + laplacian_pixel[2];
      });

    final_image = next_image;
  }

  image::DynamicImage::ImageRgb32F(final_image).to_rgb8()
}

fn convert_image_into_pattern(
  image: image::RgbImage,
  width: u16,
  height: u16,
  target_palette: &[PaletteItem],
) -> anyhow::Result<Pattern> {
  let fabric = Fabric {
    width,
    height,
    ..Fabric::default()
  };

  let mut palette_map = ordermap::OrderMap::new();
  let mut fullstitches = Vec::with_capacity((width * height) as usize);

  for (x, y, pixel) in image.enumerate_pixels() {
    let x = Coord::new(x as f32)?;
    let y = Coord::new(y as f32)?;

    if let Some(palindex) = palette_map.get_index_of(&pixel.0) {
      fullstitches.push(FullStitch {
        x,
        y,
        palindex: palindex as u32,
        kind: FullStitchKind::Full,
      });
    } else {
      let [r, g, b] = pixel.0;
      let lab_color = palette::Lab::from_color(palette::Srgb::from_components((r, g, b)).into_linear::<f32>());

      let nearest = target_palette
        .iter()
        .min_by_key(|thread| {
          let thread_color = palette::Srgb::from_str(&thread.color).unwrap();
          let thread_lab_color = palette::Lab::from_color(thread_color.into_linear::<f32>());

          ordered_float::NotNan::new(lab_color.difference(thread_lab_color)).unwrap()
        })
        .unwrap();

      palette_map.insert(pixel.0, nearest.to_owned());
      fullstitches.push(FullStitch {
        x,
        y,
        palindex: (palette_map.len() - 1) as u32,
        kind: FullStitchKind::Full,
      });
    }
  }

  Ok(Pattern {
    fabric,
    palette: palette_map.into_values().collect(),
    fullstitches: Stitches::from_iter(fullstitches),
    ..Pattern::default()
  })
}
