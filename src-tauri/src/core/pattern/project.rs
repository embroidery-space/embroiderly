use super::Pattern;
use super::display::DisplaySettings;

#[derive(Debug, Default, Clone, borsh::BorshSerialize)]
pub struct PatternProject {
  pub id: uuid::Uuid,
  #[borsh(skip)]
  pub file_path: std::path::PathBuf,
  pub pattern: Pattern,
  pub display_settings: DisplaySettings,
}

impl PatternProject {
  pub fn new(file_path: std::path::PathBuf, pattern: Pattern, display_settings: DisplaySettings) -> Self {
    Self {
      id: uuid::Uuid::new_v4(),
      file_path,
      pattern,
      display_settings,
    }
  }
}
