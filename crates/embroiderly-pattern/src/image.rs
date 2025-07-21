#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize))]
pub struct ReferenceImage {
  #[borsh(skip)]
  pub format: image::ImageFormat,
  pub content: Vec<u8>,
}

impl borsh::BorshDeserialize for ReferenceImage {
  fn deserialize_reader<R: std::io::Read>(reader: &mut R) -> std::io::Result<Self> {
    let content: Vec<u8> = borsh::BorshDeserialize::deserialize_reader(reader)?;
    let format = image::guess_format(&content).unwrap_or(image::ImageFormat::Png);
    Ok(ReferenceImage { format, content })
  }
}
