use embroiderly_pattern::PatternProject;

pub mod display;
pub use display::DisplayAction;

pub mod fabric;
pub use fabric::FabricAction;

pub mod grid;
pub use grid::GridAction;

pub mod image;
pub use image::ImageAction;

pub mod layers;
pub use layers::LayerAction;

pub mod palette;
pub use palette::PaletteAction;

pub mod pattern;
pub use pattern::PatternAction;

pub mod publish;
pub use publish::PublishAction;

pub mod stitches;
pub use stitches::StitchAction;

use crate::EditorEvent;
use crate::error::Result;

#[derive(Debug, Clone, borsh::BorshSerialize, borsh::BorshDeserialize)]
pub enum EditorAction {
  Stitch(StitchAction),
  Fabric(FabricAction),
  Palette(PaletteAction),
  Pattern(PatternAction),
  Display(DisplayAction),
  Grid(GridAction),
  Layer(LayerAction),
  Publish(PublishAction),
  Image(ImageAction),

  #[cfg(test)]
  Mock,
}

impl EditorAction {
  pub fn perform(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Stitch(a) => a.perform(patproj),
      Self::Fabric(a) => a.perform(patproj),
      Self::Palette(a) => a.perform(patproj),
      Self::Pattern(a) => a.perform(patproj),
      Self::Display(a) => a.perform(patproj),
      Self::Grid(a) => a.perform(patproj),
      Self::Layer(a) => a.perform(patproj),
      Self::Publish(a) => a.perform(patproj),
      Self::Image(a) => a.perform(patproj),

      #[cfg(test)]
      Self::Mock => Ok(vec![]),
    }
  }

  pub fn revoke(&mut self, patproj: &mut PatternProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Stitch(a) => a.revoke(patproj),
      Self::Fabric(a) => a.revoke(patproj),
      Self::Palette(a) => a.revoke(patproj),
      Self::Pattern(a) => a.revoke(patproj),
      Self::Display(a) => a.revoke(patproj),
      Self::Grid(a) => a.revoke(patproj),
      Self::Layer(a) => a.revoke(patproj),
      Self::Publish(a) => a.revoke(patproj),
      Self::Image(a) => a.revoke(patproj),

      #[cfg(test)]
      Self::Mock => Ok(vec![]),
    }
  }
}
