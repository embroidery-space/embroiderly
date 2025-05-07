use borsh::{BorshDeserialize, BorshSerialize};

use super::{LineStitch, NodeStitch};
use crate::core::pattern::Coord;

#[derive(Debug, Clone, Copy, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub struct SpecialStitch {
  pub x: Coord,
  pub y: Coord,
  pub rotation: u16,
  pub flip: (bool, bool),
  pub palindex: u32,
  pub modindex: u32,
}

impl PartialOrd for SpecialStitch {
  fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
    Some(self.cmp(other))
  }
}

impl Ord for SpecialStitch {
  fn cmp(&self, other: &Self) -> std::cmp::Ordering {
    self.y.cmp(&other.y).then(self.x.cmp(&other.x))
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct SpecialStitchModel {
  pub unique_name: String,
  pub name: String,
  pub width: f32,
  pub height: f32,
  pub nodestitches: Vec<NodeStitch>,
  pub linestitches: Vec<LineStitch>,
  pub curvedstitches: Vec<CurvedStitch>,
}

#[derive(Debug, Clone, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub struct CurvedStitch {
  pub points: Vec<(Coord, Coord)>,
}
