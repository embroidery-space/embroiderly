use xsp_parsers::pmaker;

use super::{Coord, LineStitch, NodeStitch};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
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

impl TryFrom<pmaker::SpecialStitch> for SpecialStitch {
  type Error = anyhow::Error;

  fn try_from(special_stitch: pmaker::SpecialStitch) -> Result<Self, Self::Error> {
    Ok(Self {
      x: Coord::new(special_stitch.x)?,
      y: Coord::new(special_stitch.y)?,
      rotation: special_stitch.rotation,
      flip: special_stitch.flip,
      palindex: special_stitch.palindex as u32,
      modindex: special_stitch.modindex as u32,
    })
  }
}

#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct SpecialStitchModel {
  pub unique_name: String,
  pub name: String,
  pub width: f32,
  pub height: f32,
  pub nodestitches: Vec<NodeStitch>,
  pub linestitches: Vec<LineStitch>,
  pub curvedstitches: Vec<CurvedStitch>,
}

impl TryFrom<pmaker::SpecialStitchModel> for SpecialStitchModel {
  type Error = anyhow::Error;

  fn try_from(spsmodel: pmaker::SpecialStitchModel) -> Result<Self, Self::Error> {
    Ok(Self {
      unique_name: spsmodel.unique_name,
      name: spsmodel.name,
      width: spsmodel.width,
      height: spsmodel.height,
      nodestitches: spsmodel
        .nodestitches
        .into_iter()
        .map(NodeStitch::try_from)
        .collect::<Result<Vec<_>, _>>()?,
      linestitches: spsmodel
        .linestitches
        .into_iter()
        .map(LineStitch::try_from)
        .collect::<Result<Vec<_>, _>>()?,
      curvedstitches: spsmodel
        .curvedstitches
        .into_iter()
        .map(CurvedStitch::try_from)
        .collect::<Result<Vec<_>, _>>()?,
    })
  }
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
pub struct CurvedStitch {
  pub points: Vec<(Coord, Coord)>,
}

impl TryFrom<pmaker::CurvedStitch> for CurvedStitch {
  type Error = anyhow::Error;

  fn try_from(curvedstitch: pmaker::CurvedStitch) -> Result<Self, Self::Error> {
    Ok(Self {
      points: curvedstitch
        .points
        .into_iter()
        .map(|(x, y)| Ok((Coord::new(x)?, Coord::new(y)?)))
        .collect::<Result<Vec<_>, Self::Error>>()?,
    })
  }
}
