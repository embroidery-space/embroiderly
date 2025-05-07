use std::collections::BTreeSet;

use borsh::{BorshDeserialize, BorshSerialize};
use ordered_float::NotNan;

use super::*;

#[cfg(test)]
#[path = "./stitches.test.rs"]
mod tests;

pub type Coord = ordered_float::NotNan<f32>;

#[derive(Debug, Clone, Copy, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub enum Stitch {
  Full(FullStitch),
  Part(PartStitch),
  Line(LineStitch),
  Node(NodeStitch),
}

impl From<FullStitch> for Stitch {
  fn from(fullstitch: FullStitch) -> Self {
    Self::Full(fullstitch)
  }
}

impl From<PartStitch> for Stitch {
  fn from(partstitch: PartStitch) -> Self {
    Self::Part(partstitch)
  }
}

impl From<LineStitch> for Stitch {
  fn from(linestitch: LineStitch) -> Self {
    Self::Line(linestitch)
  }
}
impl From<NodeStitch> for Stitch {
  fn from(nodestitch: NodeStitch) -> Self {
    Self::Node(nodestitch)
  }
}

/// A set of stitches.
#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
pub struct Stitches<T: Ord> {
  inner: BTreeSet<T>,
}

impl<T: Ord> Default for Stitches<T> {
  fn default() -> Self {
    Self { inner: BTreeSet::new() }
  }
}

impl<T: Ord> Stitches<T> {
  pub fn new() -> Self {
    Self::default()
  }

  pub fn iter(&self) -> impl Iterator<Item = &T> {
    self.inner.iter()
  }

  #[cfg(test)]
  pub fn len(&self) -> usize {
    self.inner.len()
  }

  /// Returns `true` if the set contains a stitch.
  pub fn contains(&self, stitch: &T) -> bool {
    match self.inner.get(stitch) {
      Some(contained) => {
        // We need to use the `get` method to get the actual stitch.
        // Then we need to compare the actual stitch with the passed stitch.
        // This is because the indexing is done only by the fields that are used for ordering (coordinates, kind, etc.).
        // But we need to compare all the other values (mainly, palindex).
        contained == stitch
      }
      None => false,
    }
  }

  /// Inserts a stitch into the set, replacing the existing one.
  /// Returns the replaced stitch if any.
  pub fn insert(&mut self, stitch: T) -> Option<T> {
    // We need to use the `replace` method to get the replaced value from the set.
    // We need to return the previous value to pass it back to the caller, so it can be used to update the pattern on the frontend.
    self.inner.replace(stitch)
  }

  /// Removes and returns a stitch from the set.
  pub fn remove(&mut self, stitch: &T) -> Option<T> {
    // We need to use the `take` method to get the actual value from the set.
    // The passed `stitch` contains only the fields that are used for ordering (coordinates, kind, etc.).
    // Hovewer, we need to return the actual stitch that contains all the other values (mainly, palindex), so it can be used to update the pattern on the frontend.
    self.inner.take(stitch)
  }

  pub fn get(&self, stitch: &T) -> Option<&T> {
    self.inner.get(stitch)
  }
}

impl<T: Ord> FromIterator<T> for Stitches<T> {
  fn from_iter<I: IntoIterator<Item = T>>(iter: I) -> Self {
    Self { inner: BTreeSet::from_iter(iter) }
  }
}

impl<T: Ord> Extend<T> for Stitches<T> {
  fn extend<I: IntoIterator<Item = T>>(&mut self, iter: I) {
    self.inner.extend(iter);
  }
}

impl Stitches<FullStitch> {
  /// Removes and returns all the conflicts with a given full stitch.
  /// It looks for any petite stitches that overlap with the full stitch.
  pub fn remove_conflicts_with_full_stitch(&mut self, fullstitch: &FullStitch) -> Vec<FullStitch> {
    debug_assert_eq!(fullstitch.kind, FullStitchKind::Full);
    let mut conflicts = Vec::new();

    let x = NotNan::new(fullstitch.x + 0.5).unwrap();
    let y = NotNan::new(fullstitch.y + 0.5).unwrap();
    let kind = FullStitchKind::Petite;

    for petite in [
      FullStitch { kind, ..*fullstitch },
      FullStitch { x, kind, ..*fullstitch },
      FullStitch { y, kind, ..*fullstitch },
      FullStitch { x, y, kind, ..*fullstitch },
    ] {
      self.remove(&petite).inspect(|&petite| conflicts.push(petite));
    }

    conflicts
  }

  /// Removes and returns all the conflicts with a given petite stitch.
  /// It looks for the full stitch that overlaps with the petite stitch.
  pub fn remove_conflicts_with_petite_stitch(&mut self, fullstitch: &FullStitch) -> Vec<FullStitch> {
    debug_assert_eq!(fullstitch.kind, FullStitchKind::Petite);
    let mut conflicts = Vec::new();

    let fullstitch = FullStitch {
      x: NotNan::new(fullstitch.x.trunc()).unwrap(),
      y: NotNan::new(fullstitch.y.trunc()).unwrap(),
      palindex: fullstitch.palindex,
      kind: FullStitchKind::Full,
    };

    self.remove(&fullstitch).inspect(|&fs| conflicts.push(fs));

    conflicts
  }

  /// Removes and returns all the conflicts with a given half stitch.
  /// It looks for the full and any petite stitches that overlap with the half stitch.
  pub fn remove_conflicts_with_half_stitch(&mut self, partstitch: &PartStitch) -> Vec<FullStitch> {
    debug_assert_eq!(partstitch.kind, PartStitchKind::Half);
    let mut conflicts = Vec::new();
    let fullstitch: FullStitch = partstitch.to_owned().into();

    let y = NotNan::new(partstitch.y + 0.5).unwrap();
    let x = NotNan::new(partstitch.x + 0.5).unwrap();
    let kind = FullStitchKind::Petite;
    match partstitch.direction {
      PartStitchDirection::Forward => {
        for petite in [
          FullStitch { x, kind, ..fullstitch },
          FullStitch { y, kind, ..fullstitch },
        ] {
          self.remove(&petite).inspect(|&petite| conflicts.push(petite));
        }
      }
      PartStitchDirection::Backward => {
        for petite in [
          FullStitch { kind, ..fullstitch },
          FullStitch { x, y, kind, ..fullstitch },
        ] {
          self.remove(&petite).inspect(|&petite| conflicts.push(petite));
        }
      }
    };

    self.remove(&fullstitch).inspect(|&fs| conflicts.push(fs));

    conflicts
  }

  /// Removes and returns all the conflicts with a given quarter stitch.
  /// It looks for the full and petite stitches that overlap with the quarter stitch.
  pub fn remove_conflicts_with_quarter_stitch(&mut self, partstitch: &PartStitch) -> Vec<FullStitch> {
    debug_assert_eq!(partstitch.kind, PartStitchKind::Quarter);
    let mut conflicts = Vec::new();

    for fullstitch in [
      FullStitch {
        x: NotNan::new(partstitch.x.trunc()).unwrap(),
        y: NotNan::new(partstitch.y.trunc()).unwrap(),
        palindex: partstitch.palindex,
        kind: FullStitchKind::Full,
      },
      partstitch.to_owned().into(), // Petite
    ] {
      self.remove(&fullstitch).inspect(|&fs| conflicts.push(fs));
    }

    conflicts
  }

  pub fn remove_stitches_outside_bounds(&mut self, x: u16, y: u16, width: u16, height: u16) -> Vec<FullStitch> {
    let mut conflicts = Vec::new();
    for fullstitch in std::mem::take(&mut self.inner).into_iter() {
      if fullstitch.x < x.into()
        || fullstitch.x >= (x + width).into()
        || fullstitch.y < y.into()
        || fullstitch.y >= (y + height).into()
      {
        conflicts.push(fullstitch);
      } else {
        self.inner.insert(fullstitch);
      }
    }
    conflicts
  }
}

impl Stitches<PartStitch> {
  /// Removes and returns all the conflicts with a given full stitch.
  /// It looks for any half and quarter stitches that overlap with the full stitch.
  pub fn remove_conflicts_with_full_stitch(&mut self, fullstitch: &FullStitch) -> Vec<PartStitch> {
    debug_assert_eq!(fullstitch.kind, FullStitchKind::Full);
    let mut conflicts = Vec::new();

    let partstitch: PartStitch = fullstitch.to_owned().into();
    let x = NotNan::new(fullstitch.x + 0.5).unwrap();
    let y = NotNan::new(fullstitch.y + 0.5).unwrap();

    for partstitch in [
      PartStitch {
        direction: PartStitchDirection::Forward,
        ..partstitch
      },
      PartStitch {
        direction: PartStitchDirection::Backward,
        ..partstitch
      },
      PartStitch {
        kind: PartStitchKind::Quarter,
        direction: PartStitchDirection::Backward,
        ..partstitch
      },
      PartStitch {
        x,
        kind: PartStitchKind::Quarter,
        direction: PartStitchDirection::Forward,
        ..partstitch
      },
      PartStitch {
        y,
        kind: PartStitchKind::Quarter,
        direction: PartStitchDirection::Forward,
        ..partstitch
      },
      PartStitch {
        x,
        y,
        kind: PartStitchKind::Quarter,
        direction: PartStitchDirection::Backward,
        ..partstitch
      },
    ] {
      self.remove(&partstitch).inspect(|&ps| conflicts.push(ps));
    }

    conflicts
  }

  /// Removes and returns all the conflicts with a given petite stitch.
  /// It looks for the half and quarter stitches that overlap with the petite stitch.
  pub fn remove_conflicts_with_petite_stitch(&mut self, fullstitch: &FullStitch) -> Vec<PartStitch> {
    debug_assert_eq!(fullstitch.kind, FullStitchKind::Petite);
    let mut conflicts = Vec::new();

    let x = fullstitch.x;
    let y = fullstitch.y;
    let palindex = fullstitch.palindex;
    let direction = PartStitchDirection::from((x, y));

    let half = PartStitch {
      x: NotNan::new(x.trunc()).unwrap(),
      y: NotNan::new(y.trunc()).unwrap(),
      palindex,
      direction,
      kind: PartStitchKind::Half,
    };
    self.remove(&half).inspect(|&half| conflicts.push(half));

    let quarter = PartStitch {
      x,
      y,
      palindex,
      direction,
      kind: PartStitchKind::Quarter,
    };
    self.remove(&quarter).inspect(|&quarter| conflicts.push(quarter));

    conflicts
  }

  /// Removes and returns all the conflicts with a given half stitch.
  /// It looks for any quarter stitches that overlap with the half stitch.
  pub fn remove_conflicts_with_half_stitch(&mut self, partstitch: &PartStitch) -> Vec<PartStitch> {
    debug_assert_eq!(partstitch.kind, PartStitchKind::Half);
    let mut conflicts = Vec::new();

    let x = NotNan::new(partstitch.x + 0.5).unwrap();
    let y = NotNan::new(partstitch.y + 0.5).unwrap();
    let kind = PartStitchKind::Quarter;

    match partstitch.direction {
      PartStitchDirection::Forward => {
        for quarter in [
          PartStitch {
            x,
            kind,
            direction: PartStitchDirection::Forward,
            ..*partstitch
          },
          PartStitch {
            y,
            kind,
            direction: PartStitchDirection::Forward,
            ..*partstitch
          },
        ] {
          self.remove(&quarter).inspect(|&quarter| conflicts.push(quarter));
        }
      }
      PartStitchDirection::Backward => {
        for quarter in [
          PartStitch {
            kind,
            direction: PartStitchDirection::Backward,
            ..*partstitch
          },
          PartStitch {
            x,
            y,
            kind,
            direction: PartStitchDirection::Backward,
            ..*partstitch
          },
        ] {
          self.remove(&quarter).inspect(|&quarter| conflicts.push(quarter));
        }
      }
    }

    conflicts
  }

  /// Removes and returns all the conflicts with a given quarter stitch.
  /// It looks for the half stitch that overlap with the quarter stitch.
  pub fn remove_conflicts_with_quarter_stitch(&mut self, partstitch: &PartStitch) -> Vec<PartStitch> {
    debug_assert_eq!(partstitch.kind, PartStitchKind::Quarter);
    let mut conflicts = Vec::new();

    let half = PartStitch {
      x: NotNan::new(partstitch.x.trunc()).unwrap(),
      y: NotNan::new(partstitch.y.trunc()).unwrap(),
      palindex: partstitch.palindex,
      direction: PartStitchDirection::from((partstitch.x, partstitch.y)),
      kind: PartStitchKind::Half,
    };
    self.remove(&half).inspect(|&half| conflicts.push(half));

    conflicts
  }

  pub fn remove_stitches_outside_bounds(&mut self, x: u16, y: u16, width: u16, height: u16) -> Vec<PartStitch> {
    let mut conflicts = Vec::new();
    for fullstitch in std::mem::take(&mut self.inner).into_iter() {
      if fullstitch.x < x.into()
        || fullstitch.x >= (x + width).into()
        || fullstitch.y < y.into()
        || fullstitch.y >= (y + height).into()
      {
        conflicts.push(fullstitch);
      } else {
        self.inner.insert(fullstitch);
      }
    }
    conflicts
  }
}

impl Stitches<LineStitch> {
  pub fn remove_stitches_outside_bounds(&mut self, x: u16, y: u16, width: u16, height: u16) -> Vec<LineStitch> {
    let mut conflicts = Vec::new();
    for line in std::mem::take(&mut self.inner).into_iter() {
      if line.x.0 < x.into()
        || line.x.1 < x.into()
        || line.x.0 > (x + width).into()
        || line.x.1 > (x + width).into()
        || line.y.0 < y.into()
        || line.y.1 < y.into()
        || line.y.0 > (y + height).into()
        || line.y.1 > (y + height).into()
      {
        conflicts.push(line);
      } else {
        self.inner.insert(line);
      }
    }
    conflicts
  }
}

impl Stitches<NodeStitch> {
  pub fn remove_stitches_outside_bounds(&mut self, x: u16, y: u16, width: u16, height: u16) -> Vec<NodeStitch> {
    let mut conflicts = Vec::new();
    for node in std::mem::take(&mut self.inner).into_iter() {
      if node.x < x.into() || node.x >= (x + width).into() || node.y < y.into() || node.y >= (y + height).into() {
        conflicts.push(node);
      } else {
        self.inner.insert(node);
      }
    }
    conflicts
  }
}

macro_rules! stitches_with_palindex_impl {
  ($type:ty) => {
    impl Stitches<$type> {
      pub fn remove_stitches_by_palindexes(&mut self, palindexes: &[u32]) -> Vec<$type> {
        let mut remaining_stitches = Vec::new();
        let mut removed_stitches = Vec::new();

        // First, we need to separate the stitches into two groups: the ones that should be removed and the ones that should remain.
        for stitch in std::mem::take(&mut self.inner).into_iter() {
          if palindexes.contains(&stitch.palindex) {
            removed_stitches.push(stitch);
          } else {
            remaining_stitches.push(stitch);
          }
        }

        // Then, we need to reinsert the remaining stitches into the set with the new palette item indexes.
        let mut palindexes_map = std::collections::HashMap::new();
        'outer: for mut stitch in remaining_stitches.into_iter() {
          match palindexes_map.get(&stitch.palindex) {
            Some(&new_palindex) => {
              stitch.palindex = new_palindex;
            }
            None => {
              for (index, &palindex) in palindexes.iter().enumerate().rev() {
                if stitch.palindex > palindex {
                  let new_palindex = stitch.palindex - (index as u32) - 1;
                  palindexes_map.insert(stitch.palindex, new_palindex);
                  stitch.palindex = new_palindex;
                  self.inner.insert(stitch);
                  continue 'outer;
                }
              }
              palindexes_map.insert(stitch.palindex, stitch.palindex);
            }
          }
          self.inner.insert(stitch);
        }

        removed_stitches
      }

      pub fn restore_stitches(&mut self, stitches: Vec<$type>, palindexes: &[u32], palsize: u32) {
        // First, we need to create a map of the old palette item indexes to the new ones.
        // We do this by iterating over the complete range of current palette item indexes
        // and incrementing those that are greater than the removed ones.
        let mut palindexes_map = std::collections::HashMap::new();
        let mut counter = 0;
        for palindex in 0..palsize {
          while palindexes.contains(&(palindex + counter)) {
            counter += 1;
          }
          let new_palindex = palindex + counter;
          palindexes_map.insert(palindex, new_palindex);
        }

        // Then, we need to update the palette item indexes of the stitches.
        for mut stitch in std::mem::take(&mut self.inner).into_iter() {
          let new_palindex = palindexes_map.get(&stitch.palindex).unwrap();
          stitch.palindex = *new_palindex;
          self.inner.insert(stitch);
        }
        self.inner.extend(stitches);
      }
    }
  };
}

stitches_with_palindex_impl!(FullStitch);
stitches_with_palindex_impl!(PartStitch);
stitches_with_palindex_impl!(LineStitch);
stitches_with_palindex_impl!(NodeStitch);
