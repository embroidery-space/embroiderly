use embroiderly_pattern::Coord;

pub struct AttributesMap {
  inner: std::collections::HashMap<String, String>,
}

impl AttributesMap {
  pub fn get(&self, key: &str) -> Option<&str> {
    self.inner.get(key).map(std::string::String::as_str)
  }

  #[must_use]
  pub fn get_coord(&self, key: &str) -> Option<Coord> {
    self.get(key).and_then(|s| {
      let normalized = s.replace(',', ".");
      normalized.parse().ok()
    })
  }

  #[must_use]
  pub fn get_palindex(&self, key: &str) -> Option<u32> {
    match self.get(key).and_then(|s| s.parse::<u32>().ok()) {
      Some(palindex) if palindex != 0 => Some(palindex - 1),
      _ => None,
    }
  }

  #[must_use]
  pub fn get_color(&self, key: &str) -> Option<&str> {
    let color = self.get(key);
    if color.is_some_and(|c| c.is_empty() || c == "nil") {
      None
    } else {
      color
    }
  }

  #[must_use]
  pub fn get_objecttype(&self, key: &str) -> Option<String> {
    self
      .get(key)
      .and_then(|s| if s.is_empty() { None } else { Some(s.to_owned()) })
  }

  #[must_use]
  pub fn get_bool(&self, key: &str) -> Option<bool> {
    self.get(key).and_then(|s| {
      let normalized = s.to_lowercase();
      normalized.parse().ok()
    })
  }

  #[must_use]
  pub fn get_parsed<T: std::str::FromStr>(&self, key: &str) -> Option<T> {
    self.get(key).and_then(|s| s.parse::<T>().ok())
  }

  #[must_use]
  pub fn get_symbol(&self, key: &str) -> Option<char> {
    self.get(key).and_then(|s| {
      if s.chars().count() == 1 {
        // First try to parse as a single character.
        s.chars().next()
      } else {
        // Try to parse as a numeric char code.
        s.parse::<u32>().ok().and_then(char::from_u32)
      }
    })
  }
}

impl TryFrom<quick_xml::events::attributes::Attributes<'_>> for AttributesMap {
  type Error = anyhow::Error;

  fn try_from(attributes: quick_xml::events::attributes::Attributes) -> Result<Self, Self::Error> {
    let mut map = std::collections::HashMap::new();
    for attr in attributes {
      let attr = attr?;
      let key = String::from_utf8(attr.key.as_ref().to_vec())?;
      let value = String::from_utf8(attr.value.to_vec())?;
      map.insert(key, value);
    }
    Ok(Self { inner: map })
  }
}
