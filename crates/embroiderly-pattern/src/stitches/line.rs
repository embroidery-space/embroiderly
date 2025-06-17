use xsp_parsers::pmaker;

use super::Coord;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct LineStitch {
  pub x: (Coord, Coord),
  pub y: (Coord, Coord),
  pub palindex: u32,
  pub kind: LineStitchKind,
}

impl PartialOrd for LineStitch {
  fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
    Some(self.cmp(other))
  }
}

impl Ord for LineStitch {
  fn cmp(&self, other: &Self) -> std::cmp::Ordering {
    self.y.cmp(&other.y).then(self.x.cmp(&other.x))
  }
}

impl TryFrom<pmaker::LineStitch> for LineStitch {
  type Error = anyhow::Error;

  fn try_from(linestitch: pmaker::LineStitch) -> Result<Self, Self::Error> {
    Ok(Self {
      x: (Coord::new(linestitch.x.0)?, Coord::new(linestitch.x.1)?),
      y: (Coord::new(linestitch.y.0)?, Coord::new(linestitch.y.1)?),
      palindex: linestitch.palindex as u32,
      kind: linestitch.kind.into(),
    })
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub enum LineStitchKind {
  Back,
  Straight,
}

impl std::fmt::Display for LineStitchKind {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    match self {
      LineStitchKind::Back => write!(f, "backstitch"),
      LineStitchKind::Straight => write!(f, "straightstitch"),
    }
  }
}

impl std::str::FromStr for LineStitchKind {
  type Err = anyhow::Error;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    match s {
      "backstitch" => Ok(LineStitchKind::Back),
      "straightstitch" => Ok(LineStitchKind::Straight),
      _ => Ok(LineStitchKind::Back),
    }
  }
}

impl From<pmaker::LineStitchKind> for LineStitchKind {
  fn from(kind: pmaker::LineStitchKind) -> Self {
    match kind {
      pmaker::LineStitchKind::Back => LineStitchKind::Back,
      pmaker::LineStitchKind::Straight => LineStitchKind::Straight,
    }
  }
}
