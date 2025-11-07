use embroiderly_pattern::{
  BrandPaletteItem, Coord, Fabric, FullStitch, FullStitchKind, Palette, PaletteItem, Pattern, PatternInfo, Stitches,
};
use image::RgbImage;
use palette::color_difference::EuclideanDistance as _;
use palette::{IntoColor as _, Lab, Srgb};

use crate::imageproc;

/// The number of levels in the Laplacian pyramid.
const PYRAMID_LEVELS: usize = 3;

/// Kmeans options: (max_iters, convergence, seed).
const KMEANS_OPTIONS: (usize, f32, u64) = (20, 5.0, 0);

#[derive(Debug, Clone, PartialEq, Eq)]
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageImportOptions {
  /// The pattern size in stitches.
  pattern_size: (u16, u16),
  /// The number of colors in the palette.
  palette_size: usize,
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

  log::debug!("Loading the target image and resizing it to the {width}x{height} dimensions.");
  let img = image::open(&image_path)?
    .resize_exact(width as u32, height as u32, image::imageops::FilterType::Nearest)
    .to_rgb8();

  log::debug!("Converting the target palette to the LAB color space.",);
  let target_palette: Vec<(Lab, BrandPaletteItem)> = target_palette
    .into_iter()
    .filter_map(|palitem| {
      imageproc::utils::color::hex_to_lab(&palitem.color)
        .ok()
        .map(|lab| (lab, palitem))
    })
    .collect();
  anyhow::ensure!(
    target_palette.len() == target_palette_size,
    "Some colors could not be converted to LAB"
  );

  log::debug!("Building the Laplacian pyramid.");
  let laplacian_pyramid = imageproc::pyramid::build_laplacian_pyramid(&img, PYRAMID_LEVELS);

  log::debug!("Processing the Laplacian pyramid.");
  let palette_size_ditribution =
    imageproc::utils::palette::calculate_palette_size_per_pyramid_level(PYRAMID_LEVELS, palette_size);
  let processed_pyramid = laplacian_pyramid
    .iter()
    .zip(palette_size_ditribution)
    .map(|(level, palette_size)| quantize_image(level, palette_size))
    .collect::<Vec<RgbImage>>();

  log::debug!("Reconstructing the image.");
  let final_image = crate::imageproc::pyramid::reconstruct_from_laplacian_pyramid(&processed_pyramid);

  log::debug!("Converting image into pattern.");
  let pattern_title = image_path.file_stem().unwrap().to_string_lossy().to_string();
  let pattern = finalize_pattern(pattern_title, width, height, &final_image, &target_palette)?;

  Ok(pattern)
}

/// Quantizes an image to `k` colors.
fn quantize_image(image: &RgbImage, k: usize) -> RgbImage {
  use kmeans_colors::{Kmeans, MapColor as _, get_kmeans};

  // Convert all pixels to LAB.
  let pixels: Vec<Lab> = image
    .pixels()
    .map(|rgb| imageproc::utils::color::rgb_to_lab(*rgb))
    .collect();

  // Run K-means.
  let Kmeans { score, centroids, indices } = {
    let (max_iters, convergence, seed) = KMEANS_OPTIONS;
    get_kmeans(k, max_iters, convergence, false, &pixels, seed)
  };
  log::debug!("K-means score: {score}");

  // Convert colors to RGB for output.
  let rgb: Vec<Srgb<u8>> = centroids.iter().map(|&x| Srgb::from_linear(x.into_color())).collect();

  // Build the resulting image.
  RgbImage::from_raw(
    image.width(),
    image.height(),
    Srgb::map_indices_to_centroids(&rgb, &indices)
      .into_iter()
      .flat_map(|c| [c.red, c.green, c.blue])
      .collect(),
  )
  .expect("The is capable to hold the buffer.")
}

fn finalize_pattern(
  title: String,
  width: u16,
  height: u16,
  image: &RgbImage,
  target_palette: &[(Lab, BrandPaletteItem)],
) -> anyhow::Result<Pattern> {
  let info = PatternInfo { title, ..Default::default() };
  let fabric = Fabric {
    width,
    height,
    ..Fabric::default()
  };

  let mut palette_map = ordermap::OrderMap::new();
  let mut fullstitches = Vec::with_capacity((width as usize) * (height as usize));

  for (x, y, pixel) in image.enumerate_pixels() {
    let x = Coord::new(x as f32)?;
    let y = Coord::new(y as f32)?;

    if !palette_map.contains_key(&pixel.0) {
      let pixel_lab = imageproc::utils::color::rgb_to_lab(*pixel);
      let nearest = target_palette
        .iter()
        .min_by(|(lab1, _), (lab2, _)| {
          pixel_lab
            .distance_squared(*lab1)
            .partial_cmp(&pixel_lab.distance_squared(*lab2))
            .unwrap_or(std::cmp::Ordering::Equal)
        })
        .unwrap();
      palette_map.insert(&pixel.0, nearest.1.to_owned());
    }

    fullstitches.push(FullStitch {
      x,
      y,
      palindex: palette_map.get_index_of(&pixel.0).unwrap() as u32,
      kind: FullStitchKind::Full,
    });
  }

  Ok(Pattern {
    info,
    fabric,
    palette: Palette::from_iter(palette_map.into_values().map(PaletteItem::from)),
    fullstitches: Stitches::from_iter(fullstitches),
    ..Pattern::default()
  })
}
