use borsh::{BorshDeserialize, BorshSerialize};

use super::partstitch::*;
use crate::core::pattern::Coord;

#[derive(Debug, Clone, Copy, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub struct FullStitch {
  pub x: Coord,
  pub y: Coord,
  pub palindex: u32,
  pub kind: FullStitchKind,
}

impl PartialOrd for FullStitch {
  fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
    Some(self.cmp(other))
  }
}

impl Ord for FullStitch {
  fn cmp(&self, other: &Self) -> std::cmp::Ordering {
    self
      .y
      .cmp(&other.y)
      .then(self.x.cmp(&other.x))
      .then(self.kind.cmp(&other.kind))
  }
}

impl From<PartStitch> for FullStitch {
  fn from(partstitch: PartStitch) -> Self {
    Self {
      x: partstitch.x,
      y: partstitch.y,
      palindex: partstitch.palindex,
      kind: partstitch.kind.into(),
    }
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, BorshSerialize, BorshDeserialize)]
pub enum FullStitchKind {
  Full,
  Petite,
}

impl From<PartStitchKind> for FullStitchKind {
  fn from(kind: PartStitchKind) -> Self {
    match kind {
      PartStitchKind::Half => FullStitchKind::Full,
      PartStitchKind::Quarter => FullStitchKind::Petite,
    }
  }
}
