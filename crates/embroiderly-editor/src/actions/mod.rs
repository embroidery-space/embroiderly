use embroiderly_pattern::EmbroiderlyProject;

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
  pub fn perform(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Stitch(a) => a.perform(embproj),
      Self::Fabric(a) => a.perform(embproj),
      Self::Palette(a) => a.perform(embproj),
      Self::Pattern(a) => a.perform(embproj),
      Self::Display(a) => a.perform(embproj),
      Self::Grid(a) => a.perform(embproj),
      Self::Layer(a) => a.perform(embproj),
      Self::Publish(a) => a.perform(embproj),
      Self::Image(a) => a.perform(embproj),

      #[cfg(test)]
      Self::Mock => Ok(vec![]),
    }
  }

  pub fn revoke(&mut self, embproj: &mut EmbroiderlyProject) -> Result<Vec<EditorEvent>> {
    match self {
      Self::Stitch(a) => a.revoke(embproj),
      Self::Fabric(a) => a.revoke(embproj),
      Self::Palette(a) => a.revoke(embproj),
      Self::Pattern(a) => a.revoke(embproj),
      Self::Display(a) => a.revoke(embproj),
      Self::Grid(a) => a.revoke(embproj),
      Self::Layer(a) => a.revoke(embproj),
      Self::Publish(a) => a.revoke(embproj),
      Self::Image(a) => a.revoke(embproj),

      #[cfg(test)]
      Self::Mock => Ok(vec![]),
    }
  }
}
