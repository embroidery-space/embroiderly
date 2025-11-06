use embroiderly_pattern::{
  BrandPaletteItem, Coord, Fabric, FullStitch, FullStitchKind, Palette, PaletteItem, Pattern, PatternInfo, Stitches,
};
use image::RgbImage;
use palette::Lab;
use palette::color_difference::EuclideanDistance as _;

use crate::imageproc;

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

  log::debug!("Processing the image.");
  let (centroids, indexes) = quantize_image(&img, &target_palette, palette_size);

  log::debug!("Converting image into pattern.");
  let pattern_title = image_path.file_stem().unwrap().to_string_lossy().to_string();
  let pattern = finalize_pattern(pattern_title, width, height, centroids, indexes)?;

  Ok(pattern)
}

/// Quantizes an image to `k` colors by custom palette.
/// Return an array of centroids mapped to nearest palette colors and an array of indexes.
fn quantize_image<'palette>(
  image: &RgbImage,
  target_palette: &'palette [(Lab, BrandPaletteItem)],
  k: usize,
) -> (Vec<&'palette (Lab, BrandPaletteItem)>, Vec<u8>) {
  // Convert all pixels to LAB.
  let pixels: Vec<Lab> = image
    .pixels()
    .map(|rgb| imageproc::utils::color::rgb_to_lab(*rgb))
    .collect();

  // Run K-means.
  let kmeans_colors::Kmeans { score, centroids, indices } = {
    let (max_iters, convergence, seed) = KMEANS_OPTIONS;
    kmeans_colors::get_kmeans(k, max_iters, convergence, false, &pixels, seed)
  };
  log::debug!("K-means score: {score}");

  // Map centroids to palette colors.
  let centroids = centroids
    .into_iter()
    .map(|centroid| {
      target_palette
        .iter()
        .min_by(|(lab1, _), (lab2, _)| {
          centroid
            .distance_squared(*lab1)
            .partial_cmp(&centroid.distance_squared(*lab2))
            .unwrap_or(std::cmp::Ordering::Equal)
        })
        .unwrap()
    })
    .collect();

  (centroids, indices)
}

fn finalize_pattern(
  title: String,
  width: u16,
  height: u16,
  centroids: Vec<&(Lab, BrandPaletteItem)>,
  indexes: Vec<u8>,
) -> anyhow::Result<Pattern> {
  let info = PatternInfo { title, ..Default::default() };
  let fabric = Fabric {
    width,
    height,
    ..Fabric::default()
  };

  let mut palette_map = ordermap::OrderMap::new();
  let mut fullstitches = Vec::with_capacity((width as usize) * (height as usize));

  for (index, pixel) in indexes.into_iter().enumerate() {
    let centroid = centroids[pixel as usize];

    let x = Coord::new((index % width as usize) as f32)?;
    let y = Coord::new((index / width as usize) as f32)?;

    let palitem_key = (&centroid.1.brand, &centroid.1.number);
    if !palette_map.contains_key(&palitem_key) {
      palette_map.insert(palitem_key, centroid.1.to_owned());
    }

    fullstitches.push(FullStitch {
      x,
      y,
      palindex: palette_map.get_index_of(&palitem_key).unwrap() as u32,
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
