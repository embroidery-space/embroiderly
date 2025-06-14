use borsh::{BorshDeserialize, BorshSerialize};

use crate::core::pattern::Coord;

#[derive(Debug, Clone, Copy, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, BorshSerialize, BorshDeserialize)]
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
