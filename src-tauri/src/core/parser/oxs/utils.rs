use std::collections::HashMap;

use anyhow::Result;
use quick_xml::events::attributes::Attributes;

#[derive(Debug)]
pub enum OxsVersion {
  V1,
  Unknown(String),
}

impl From<&str> for OxsVersion {
  fn from(s: &str) -> Self {
    match s {
      "1.0" | "1.1" => OxsVersion::V1,
      _ => OxsVersion::Unknown(s.to_owned()),
    }
  }
}

#[allow(clippy::enum_variant_names)]
#[derive(Debug, Clone, PartialEq, Default)]
pub enum Software {
  #[default]
  Embroiderly,
  UrsaSoftware,
  Unknown(String),
}

impl From<&str> for Software {
  fn from(s: &str) -> Self {
    match s {
      "Embroidery Studio" | "Embroiderly" => Software::Embroiderly,
      "Ursa Software" | "MiniStitch by Ursa Software" => Software::UrsaSoftware,
      _ => Software::Unknown(s.to_owned()),
    }
  }
}

pub type MapAttributes = HashMap<String, String>;

pub fn process_attributes(attributes: Attributes) -> Result<MapAttributes> {
  let mut map = HashMap::new();
  for attr in attributes {
    let attr = attr?;
    let key = String::from_utf8(attr.key.as_ref().to_vec())?;
    let value = String::from_utf8(attr.value.to_vec())?;
    map.insert(key, value);
  }
  Ok(map)
}
