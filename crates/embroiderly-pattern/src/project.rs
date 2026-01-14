use std::path::PathBuf;

use super::display::DisplaySettings;
use super::publish::PublishSettings;
use super::{Pattern, ReferenceImage};

#[cfg(test)]
#[path = "./project.test.rs"]
mod tests;

#[derive(Debug, Default, Clone)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct PatternProject {
  pub id: uuid::Uuid,
  #[cfg_attr(feature = "borsh", borsh(skip))]
  pub file_path: Option<PathBuf>,
  pub reference_image: Option<ReferenceImage>,
  pub pattern: Pattern,
  pub display_settings: DisplaySettings,
  pub publish_settings: PublishSettings,
}

impl PatternProject {
  /// Creates a new `PatternProject` with the given pattern and default settings.
  #[must_use]
  pub fn new(pattern: Pattern) -> Self {
    PatternProjectBuilder::new(pattern).build()
  }

  /// Creates a new builder for `PatternProject` with the given pattern.
  #[must_use]
  pub const fn builder(pattern: Pattern) -> PatternProjectBuilder {
    PatternProjectBuilder::new(pattern)
  }
}

/// A builder for creating `PatternProject`s.
#[derive(Debug)]
pub struct PatternProjectBuilder {
  pattern: Pattern,
  file_path: Option<PathBuf>,
  reference_image: Option<ReferenceImage>,
  display_settings: Option<DisplaySettings>,
  publish_settings: Option<PublishSettings>,
}

impl PatternProjectBuilder {
  /// Creates a new builder with the given pattern.
  #[must_use]
  pub const fn new(pattern: Pattern) -> Self {
    Self {
      pattern,
      file_path: None,
      reference_image: None,
      display_settings: None,
      publish_settings: None,
    }
  }

  /// Sets the file path for the project.
  #[must_use]
  pub fn file_path(mut self, file_path: impl Into<PathBuf>) -> Self {
    self.file_path = Some(file_path.into());
    self
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

  /// Builds the `PatternProject`.
  #[must_use]
  pub fn build(self) -> PatternProject {
    PatternProject {
      id: uuid::Uuid::new_v4(),
      file_path: self.file_path,
      reference_image: self.reference_image,
      pattern: self.pattern,
      display_settings: self.display_settings.unwrap_or_default(),
      publish_settings: self.publish_settings.unwrap_or_default(),
    }
  }
}

impl From<Pattern> for PatternProject {
  fn from(pattern: Pattern) -> Self {
    PatternProjectBuilder::new(pattern).build()
  }
}
