use image::{RgbImage, imageops};

/// Builds a Laplacian pyramid with the specified number of levels and filter.
pub fn build_laplacian_pyramid(image: &RgbImage, levels: usize) -> Vec<RgbImage> {
  // Build Gaussian pyramid.
  let mut gaussian_pyramid = vec![image.clone()];
  for _ in 0..(levels - 1) {
    let prev = gaussian_pyramid.last().unwrap();
    let blurred = imageops::blur(prev, 1.5);
    let downscaled = downscale(&blurred);
    gaussian_pyramid.push(downscaled);
  }

  // Build Laplacian pyramid.
  let mut laplacian_pyramid = vec![];
  for i in 0..(levels - 1) {
    let upscaled = upscale(&gaussian_pyramid[i + 1], gaussian_pyramid[i].dimensions());
    let laplacian_level = subtract_images(&gaussian_pyramid[i], &upscaled);
    laplacian_pyramid.push(laplacian_level);
  }

  // The last Laplacian level is just the smallest Gaussian level.
  laplacian_pyramid.push(gaussian_pyramid.last().unwrap().clone());
  debug_assert_eq!(gaussian_pyramid.len(), laplacian_pyramid.len());

  laplacian_pyramid
}

/// Reconstructs an image from the Laplacian pyramid.
pub fn reconstruct_from_laplacian_pyramid(pyramid: &[RgbImage]) -> RgbImage {
  // Start with the base image.
  let mut current_image = pyramid.last().unwrap().clone();

  // Iterate over the pyramid from penultimate image in reverse order.
  for i in (0..pyramid.len() - 1).rev() {
    let upscaled = upscale(&current_image, pyramid[i].dimensions());
    current_image = add_images(&upscaled, &pyramid[i]);
  }

  current_image
}

/// Downscales an image by factor 2.
fn downscale(image: &RgbImage) -> RgbImage {
  let (w, h) = image.dimensions();
  let (w, h) = ((w / 2).max(1), (h / 2).max(1));
  imageops::resize(image, w, h, imageops::FilterType::Gaussian)
}

/// Upscales an image to the target dimensions.
fn upscale(image: &RgbImage, dimensions: (u32, u32)) -> RgbImage {
  let (w, h) = dimensions;
  imageops::resize(image, w, h, imageops::FilterType::Gaussian)
}

/// Performs pixel-wise saturating subtraction.
fn subtract_images(img1: &RgbImage, img2: &RgbImage) -> RgbImage {
  debug_assert_eq!(img1.dimensions(), img2.dimensions());

  let (w, h) = img1.dimensions();
  let pixels = img1
    .pixels()
    .zip(img2.pixels())
    .flat_map(|(p1, p2)| {
      [
        p1[0].saturating_sub(p2[0]),
        p1[1].saturating_sub(p2[1]),
        p1[2].saturating_sub(p2[2]),
      ]
    })
    .collect();

  RgbImage::from_raw(w, h, pixels).unwrap()
}

/// Performs pixel-wise saturating addition (img1 + img2).
fn add_images(img1: &RgbImage, img2: &RgbImage) -> RgbImage {
  debug_assert_eq!(img1.dimensions(), img2.dimensions());

  let (w, h) = img1.dimensions();
  let pixels = img1
    .pixels()
    .zip(img2.pixels())
    .flat_map(|(p1, p2)| {
      [
        p1[0].saturating_add(p2[0]),
        p1[1].saturating_add(p2[1]),
        p1[2].saturating_add(p2[2]),
      ]
    })
    .collect();

  RgbImage::from_raw(w, h, pixels).unwrap()
}
