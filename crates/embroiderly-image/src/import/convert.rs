use embroiderly_pattern::BrandPaletteItem;

/// This function processes the provided image and convert it to the cross-stitch pattern with the specified target palette and options.
pub fn convert_image_into_pattern(
  _image_path: std::path::PathBuf,
  _target_palette: Vec<BrandPaletteItem>,
  _options: super::ImageImportOptions,
) -> anyhow::Result<()> {
  todo!()
}
