use embroiderly_pattern::BrandPaletteItem;

/// This function processes the provided image and creates a preview image of the pattern with the specified target palette and options.
pub fn create_pattern_image_preview(
  image_path: std::path::PathBuf,
  output_path: std::path::PathBuf,
  _target_palette: Vec<BrandPaletteItem>,
  options: super::ImageImportOptions,
) -> anyhow::Result<()> {
  let super::ImageImportOptions { pattern_size, .. } = options;
  let (width, height) = pattern_size;

  let img = image::open(image_path)?;
  let img = img.resize_exact(width as u32, height as u32, image::imageops::FilterType::Lanczos3);

  img.save_with_format(output_path, image::ImageFormat::Jpeg)?;
  Ok(())
}
