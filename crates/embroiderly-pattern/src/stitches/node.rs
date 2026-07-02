use super::Coord;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct NodeStitch {
  pub x: Coord,
  pub y: Coord,
  pub rotated: bool,
  pub palindex: u32,
  pub kind: NodeStitchKind,
}

impl PartialOrd for NodeStitch {
  fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
    Some(self.cmp(other))
  }
}

impl Ord for NodeStitch {
  fn cmp(&self, other: &Self) -> std::cmp::Ordering {
    self.y.cmp(&other.y).then(self.x.cmp(&other.x))
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum NodeStitchKind {
  FrenchKnot,
  Bead,
}

impl std::fmt::Display for NodeStitchKind {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    match self {
      Self::FrenchKnot => write!(f, "knot"),
      Self::Bead => write!(f, "bead"),
    }
  }
}

impl std::str::FromStr for NodeStitchKind {
  type Err = anyhow::Error;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    if s == "knot" {
      return Ok(Self::FrenchKnot);
    }

    if s.starts_with("bead") {
      return Ok(Self::Bead);
    }

    Err(anyhow::anyhow!("Unknown node kind: {s}"))
  }
}
