use xsp_parsers::pmaker;

use super::{Coord, PartStitch, PartStitchKind};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
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

impl TryFrom<pmaker::FullStitch> for FullStitch {
  type Error = anyhow::Error;

  fn try_from(fullstitch: pmaker::FullStitch) -> Result<Self, Self::Error> {
    Ok(Self {
      x: Coord::new(fullstitch.x)?,
      y: Coord::new(fullstitch.y)?,
      palindex: fullstitch.palindex as u32,
      kind: fullstitch.kind.into(),
    })
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
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

impl From<pmaker::FullStitchKind> for FullStitchKind {
  fn from(kind: pmaker::FullStitchKind) -> Self {
    match kind {
      pmaker::FullStitchKind::Full => FullStitchKind::Full,
      pmaker::FullStitchKind::Petite => FullStitchKind::Petite,
    }
  }
}
