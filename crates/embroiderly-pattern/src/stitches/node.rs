use xsp_parsers::pmaker;

use super::Coord;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
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

impl TryFrom<pmaker::NodeStitch> for NodeStitch {
  type Error = anyhow::Error;

  fn try_from(nodestitch: pmaker::NodeStitch) -> Result<Self, Self::Error> {
    Ok(Self {
      x: Coord::new(nodestitch.x)?,
      y: Coord::new(nodestitch.y)?,
      rotated: nodestitch.rotated,
      palindex: nodestitch.palindex as u32,
      kind: nodestitch.kind.into(),
    })
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub enum NodeStitchKind {
  FrenchKnot,
  Bead,
}

impl std::fmt::Display for NodeStitchKind {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    match self {
      NodeStitchKind::FrenchKnot => write!(f, "knot"),
      NodeStitchKind::Bead => write!(f, "bead"),
    }
  }
}

impl std::str::FromStr for NodeStitchKind {
  type Err = anyhow::Error;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    if s == "knot" {
      return Ok(NodeStitchKind::FrenchKnot);
    }

    if s.starts_with("bead") {
      return Ok(NodeStitchKind::Bead);
    }

    Err(anyhow::anyhow!("Unknown node kind: {s}"))
  }
}

impl From<pmaker::NodeStitchKind> for NodeStitchKind {
  fn from(kind: pmaker::NodeStitchKind) -> Self {
    match kind {
      pmaker::NodeStitchKind::FrenchKnot => NodeStitchKind::FrenchKnot,
      pmaker::NodeStitchKind::Bead => NodeStitchKind::Bead,
    }
  }
}
