use super::display::DisplaySettings;
use super::publish::PublishSettings;
use super::{Pattern, ReferenceImage};

#[cfg(test)]
#[path = "./project.test.rs"]
mod tests;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct EmbroiderlyProjectId(uuid::Uuid);

impl EmbroiderlyProjectId {
  #[must_use]
  pub fn new() -> Self {
    Self(uuid::Uuid::new_v4())
  }

  #[must_use]
  pub const fn is_nil(&self) -> bool {
    self.0.is_nil()
  }
}

impl std::fmt::Display for EmbroiderlyProjectId {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    self.0.fmt(f)
  }
}

impl std::str::FromStr for EmbroiderlyProjectId {
  type Err = uuid::Error;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    uuid::Uuid::parse_str(s).map(Self)
  }
}

impl From<uuid::Uuid> for EmbroiderlyProjectId {
  fn from(uuid: uuid::Uuid) -> Self {
    Self(uuid)
  }
}

#[derive(Debug, Default, Clone)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct EmbroiderlyProject {
  pub id: EmbroiderlyProjectId,

  pub reference_image: Option<ReferenceImage>,

  pub pattern: Pattern,
  pub display_settings: DisplaySettings,
  pub publish_settings: PublishSettings,
}

impl EmbroiderlyProject {
  /// Creates a new `EmbroiderlyProject` with the given pattern and default settings.
  #[must_use]
  pub fn new(pattern: Pattern) -> Self {
    EmbroiderlyProjectBuilder::new(pattern).build()
  }

  /// Creates a new builder for `EmbroiderlyProject` with the given pattern.
  #[must_use]
  pub const fn builder(pattern: Pattern) -> EmbroiderlyProjectBuilder {
    EmbroiderlyProjectBuilder::new(pattern)
  }
}

/// A builder for creating `EmbroiderlyProject`s.
#[derive(Debug)]
pub struct EmbroiderlyProjectBuilder {
  pattern: Pattern,

  reference_image: Option<ReferenceImage>,

  display_settings: Option<DisplaySettings>,
  publish_settings: Option<PublishSettings>,
}

impl EmbroiderlyProjectBuilder {
  /// Creates a new builder with the given pattern.
  #[must_use]
  pub const fn new(pattern: Pattern) -> Self {
    Self {
      pattern,

      reference_image: None,

      display_settings: None,
      publish_settings: None,
    }
  }

  /// Sets the reference image for the project.
  #[must_use]
  pub fn reference_image(mut self, reference_image: ReferenceImage) -> Self {
    self.reference_image = Some(reference_image);
    self
  }

  /// Sets the display settings for the project.
  #[must_use]
  pub fn display_settings(mut self, display_settings: DisplaySettings) -> Self {
    self.display_settings = Some(display_settings);
    self
  }

  /// Sets the publish settings for the project.
  #[must_use]
  pub const fn publish_settings(mut self, publish_settings: PublishSettings) -> Self {
    self.publish_settings = Some(publish_settings);
    self
  }

  /// Builds the `EmbroiderlyProject`.
  #[must_use]
  pub fn build(self) -> EmbroiderlyProject {
    EmbroiderlyProject {
      id: EmbroiderlyProjectId::new(),

      reference_image: self.reference_image,

      pattern: self.pattern,
      display_settings: self.display_settings.unwrap_or_default(),
      publish_settings: self.publish_settings.unwrap_or_default(),
    }
  }
}

impl From<Pattern> for EmbroiderlyProject {
  fn from(pattern: Pattern) -> Self {
    EmbroiderlyProjectBuilder::new(pattern).build()
  }
}
