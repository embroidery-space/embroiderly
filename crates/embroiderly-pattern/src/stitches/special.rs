use super::{Bounds, Coord, LineStitch, NodeStitch};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct SpecialStitch {
  pub x: Coord,
  pub y: Coord,
  pub rotation: u16,
  pub flip: (bool, bool),
  pub palindex: u32,
  pub modindex: u32,
}

impl SpecialStitch {
  /// Returns the axis-aligned world-space bounding box of this stitch given its model.
  #[must_use]
  pub fn aabb(&self, model: &SpecialStitchModel) -> (f32, f32, f32, f32) {
    let (w, h) = (model.width, model.height);
    let corners = [(0.0f32, 0.0f32), (w, 0.0), (w, h), (0.0, h)];

    let (sin, cos) = (self.rotation as f32).to_radians().sin_cos();

    let mut min_x = f32::MAX;
    let mut min_y = f32::MAX;
    let mut max_x = f32::MIN;
    let mut max_y = f32::MIN;

    for (cx, cy) in corners {
      let cx = if self.flip.0 { -cx } else { cx };
      let cy = if self.flip.1 { -cy } else { cy };

      let wx = cy.mul_add(-sin, self.x + cx * cos);
      let wy = cy.mul_add(cos, self.y + cx * sin);

      min_x = min_x.min(wx);
      min_y = min_y.min(wy);
      max_x = max_x.max(wx);
      max_y = max_y.max(wy);
    }

    (min_x, min_y, max_x, max_y)
  }

  /// Returns `true` if any part of this stitch falls outside the given bounds.
  #[must_use]
  pub fn is_outside_bounds(&self, bounds: Bounds, model: &SpecialStitchModel) -> bool {
    // A small epsilon guards against floating-point rounding near cardinal rotations (e.g. sin/cos of exactly 90° are never precisely 0 in f32).
    const EPSILON: f32 = 1e-4;

    let (min_x, min_y, max_x, max_y) = self.aabb(model);
    min_x < bounds.x as f32 - EPSILON
      || min_y < bounds.y as f32 - EPSILON
      || max_x > (bounds.x + bounds.width) as f32 + EPSILON
      || max_y > (bounds.y + bounds.height) as f32 + EPSILON
  }
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

#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct SpecialStitchModel {
  pub unique_name: String,
  pub name: String,
  pub width: f32,
  pub height: f32,
  pub nodestitches: Vec<NodeStitch>,
  pub linestitches: Vec<LineStitch>,
  pub curvedstitches: Vec<CurvedStitch>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "borsh", derive(borsh::BorshSerialize, borsh::BorshDeserialize))]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "camelCase"))]
pub struct CurvedStitch {
  pub points: Vec<(Coord, Coord)>,
}
