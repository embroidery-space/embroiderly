use anyhow::Result;
use xsp_parsers::pmaker;

use crate::core::pattern::*;

pub fn parse_pattern<P: AsRef<std::path::Path>>(file_path: P) -> Result<PatternProject> {
  log::debug!("Parsing XSD file");

  let file_path = file_path.as_ref();
  let xsd_pattern = pmaker::parse_pattern(file_path)?;

  log::debug!("XSD file parsed");

  let pattern = Pattern {
    info: xsd_pattern.info.into(),
    fabric: xsd_pattern.fabric.into(),
    palette: {
      let mut palette = xsd_pattern
        .palette
        .into_iter()
        .map(|palitem| palitem.into())
        .collect::<Vec<_>>();

      for (i, symbols) in xsd_pattern.symbols.iter().enumerate() {
        let palitem: &mut PaletteItem = palette.get_mut(i).unwrap();

        palitem.symbol_font = Some(xsd_pattern.pattern_settings.default_stitch_font.clone());
        if let Some(code) = symbols.full {
          palitem.symbol = Some(Symbol::Code(code));
        }
      }

      palette
    },
    fullstitches: Stitches::from_iter(
      xsd_pattern
        .fullstitches
        .into_iter()
        .map(|stitch| stitch.try_into())
        .collect::<Result<Vec<_>, _>>()?,
    ),
    partstitches: Stitches::from_iter(
      xsd_pattern
        .partstitches
        .into_iter()
        .map(|stitch| stitch.try_into())
        .collect::<Result<Vec<_>, _>>()?,
    ),
    linestitches: Stitches::from_iter(
      xsd_pattern
        .linestitches
        .into_iter()
        .map(|stitch| stitch.try_into())
        .collect::<Result<Vec<_>, _>>()?,
    ),
    nodestitches: Stitches::from_iter(
      xsd_pattern
        .nodestitches
        .into_iter()
        .map(|stitch| stitch.try_into())
        .collect::<Result<Vec<_>, _>>()?,
    ),
    specialstitches: Stitches::from_iter(
      xsd_pattern
        .specialstitches
        .into_iter()
        .map(|stitch| stitch.try_into())
        .collect::<Result<Vec<_>, _>>()?,
    ),
    special_stitch_models: xsd_pattern
      .special_stitch_models
      .into_iter()
      .map(|model| model.try_into())
      .collect::<Result<Vec<_>, _>>()?,
  };
  let display_settings = DisplaySettings {
    default_symbol_font: xsd_pattern.pattern_settings.default_stitch_font,
    grid: xsd_pattern.grid.into(),
    display_mode: DisplayMode::from_pattern_maker(xsd_pattern.pattern_settings.view),
    ..Default::default()
  };

  Ok(PatternProject::new(file_path.to_owned(), pattern, display_settings))
}

impl From<pmaker::PatternInfo> for PatternInfo {
  fn from(pattern_info: pmaker::PatternInfo) -> Self {
    Self {
      title: pattern_info.title,
      author: pattern_info.author,
      copyright: pattern_info.copyright,
      description: pattern_info.description,
    }
  }
}

impl From<pmaker::Fabric> for Fabric {
  fn from(fabric: pmaker::Fabric) -> Self {
    Self {
      width: fabric.width,
      height: fabric.height,
      spi: fabric.stitches_per_inch,
      kind: fabric.kind,
      name: fabric.name,
      color: fabric.color,
    }
  }
}

impl From<pmaker::PaletteItem> for PaletteItem {
  fn from(palette_item: pmaker::PaletteItem) -> Self {
    Self {
      brand: palette_item.brand,
      number: palette_item.number,
      name: palette_item.name,
      color: palette_item.color,
      blends: palette_item
        .blends
        .map(|blends| blends.into_iter().map(Blend::from).collect()),
      symbol_font: None,
      symbol: None,
    }
  }
}

impl From<pmaker::Blend> for Blend {
  fn from(blend: pmaker::Blend) -> Self {
    Self {
      brand: blend.brand,
      number: blend.number,
    }
  }
}

impl From<pmaker::Bead> for Bead {
  fn from(bead: pmaker::Bead) -> Self {
    Self {
      length: bead.length,
      diameter: bead.diameter,
    }
  }
}

impl From<pmaker::Grid> for Grid {
  fn from(grid: pmaker::Grid) -> Self {
    Self {
      major_lines_interval: grid.major_lines_interval,
      minor_lines: GridLine {
        color: grid.minor_screen_lines.color,
        thickness: grid.minor_screen_lines.thickness,
      },
      major_lines: GridLine {
        color: grid.major_screen_lines.color,
        thickness: grid.major_screen_lines.thickness,
      },
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

impl From<pmaker::FullStitchKind> for FullStitchKind {
  fn from(kind: pmaker::FullStitchKind) -> Self {
    match kind {
      pmaker::FullStitchKind::Full => FullStitchKind::Full,
      pmaker::FullStitchKind::Petite => FullStitchKind::Petite,
    }
  }
}

impl TryFrom<pmaker::PartStitch> for PartStitch {
  type Error = anyhow::Error;

  fn try_from(partstitch: pmaker::PartStitch) -> Result<Self, Self::Error> {
    Ok(Self {
      x: Coord::new(partstitch.x)?,
      y: Coord::new(partstitch.y)?,
      palindex: partstitch.palindex as u32,
      direction: partstitch.direction.into(),
      kind: partstitch.kind.into(),
    })
  }
}

impl From<pmaker::PartStitchDirection> for PartStitchDirection {
  fn from(direction: pmaker::PartStitchDirection) -> Self {
    match direction {
      pmaker::PartStitchDirection::Forward => PartStitchDirection::Forward,
      pmaker::PartStitchDirection::Backward => PartStitchDirection::Backward,
    }
  }
}

impl From<pmaker::PartStitchKind> for PartStitchKind {
  fn from(kind: pmaker::PartStitchKind) -> Self {
    match kind {
      pmaker::PartStitchKind::Half => PartStitchKind::Half,
      pmaker::PartStitchKind::Quarter => PartStitchKind::Quarter,
    }
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

impl From<pmaker::LineStitchKind> for LineStitchKind {
  fn from(kind: pmaker::LineStitchKind) -> Self {
    match kind {
      pmaker::LineStitchKind::Back => LineStitchKind::Back,
      pmaker::LineStitchKind::Straight => LineStitchKind::Straight,
    }
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

impl From<pmaker::NodeStitchKind> for NodeStitchKind {
  fn from(kind: pmaker::NodeStitchKind) -> Self {
    match kind {
      pmaker::NodeStitchKind::FrenchKnot => NodeStitchKind::FrenchKnot,
      pmaker::NodeStitchKind::Bead => NodeStitchKind::Bead,
    }
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
