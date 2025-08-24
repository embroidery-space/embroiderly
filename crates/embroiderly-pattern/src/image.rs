#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize))]
pub struct ReferenceImage {
  #[borsh(skip)]
  pub format: image::ImageFormat,
  pub content: Vec<u8>,
  pub settings: ReferenceImageSettings,
}

impl ReferenceImage {
  pub fn new(content: Vec<u8>, settings: Option<ReferenceImageSettings>) -> Self {
    let format = image::guess_format(&content).unwrap_or(image::ImageFormat::Png);
    let settings = settings.unwrap_or_else(|| {
      let image_reader = image::ImageReader::with_format(std::io::Cursor::new(&content), format);
      let (width, height) = image_reader.into_dimensions().unwrap_or((0, 0));
      ReferenceImageSettings {
        x: 0.0,
        y: 0.0,
        width: width as f32,
        height: height as f32,
      }
    });
    Self { format, content, settings }
  }
}

impl borsh::BorshDeserialize for ReferenceImage {
  fn deserialize_reader<R: std::io::Read>(reader: &mut R) -> std::io::Result<Self> {
    let content = borsh::BorshDeserialize::deserialize_reader(reader)?;
    let settings = borsh::BorshDeserialize::deserialize_reader(reader)?;
    Ok(ReferenceImage::new(content, Some(settings)))
  }
}

#[derive(Debug, Default, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct ReferenceImageSettings {
  pub x: f32,
  pub y: f32,
  pub width: f32,
  pub height: f32,
}
