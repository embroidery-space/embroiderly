use anyhow::Result;
use embroiderly_pattern::*;
use xsp_parsers::pmaker;

pub fn parse_pattern<P: AsRef<std::path::Path>>(file_path: P) -> Result<PatternProject> {
  log::debug!("Parsing XSD file");

  let file_path = file_path.as_ref();
  let xsd_pattern = pmaker::parse_pattern(file_path)?;

  log::debug!("XSD file parsed");

  let pattern = Pattern {
    info: xsd_pattern.info.into(),
    fabric: xsd_pattern.fabric.into(),
    palette: xsd_pattern
      .palette
      .into_iter()
      .enumerate()
      .map(|(i, palitem)| {
        let pmaker::PaletteItem {
          brand,
          number,
          name,
          color,
          blends,
          ..
        } = palitem;
        let blends = blends.map(|blends| blends.into_iter().map(Blend::from).collect());

        let symbol = xsd_pattern
          .symbols
          .get(i)
          .and_then(|symbols| symbols.full)
          .and_then(|code| char::try_from(code as u32).ok())
          .and_then(|code| {
            let font = xsd_pattern
              .formats
              .get(i)
              .and_then(|format| format.font.font_name.clone())
              .unwrap_or_else(|| xsd_pattern.pattern_settings.default_stitch_font.clone());
            Symbol::new(code, font)
          });

        PaletteItem {
          brand,
          number,
          name,
          color,
          blends,
          symbol,
        }
      })
      .collect(),
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
        .map(|stitch| {
          let model = xsd_pattern
            .special_stitch_models
            .get(stitch.modindex as usize)
            .ok_or_else(|| anyhow::anyhow!("Special stitch model not found for index {}", stitch.modindex))?;
          (stitch, model.width, model.height).try_into()
        })
        .collect::<Result<Vec<_>, _>>()?,
    ),
    special_stitch_models: xsd_pattern
      .special_stitch_models
      .into_iter()
      .map(|model| model.try_into())
      .collect::<Result<Vec<_>, _>>()?,
  };
  let display_settings = DisplaySettings {
    grid: xsd_pattern.grid.into(),
    display_mode: DisplayMode::from_pattern_maker(xsd_pattern.pattern_settings.view),
    ..Default::default()
  };

  Ok(PatternProject::new(
    file_path.to_owned(),
    pattern,
    display_settings,
    Default::default(),
  ))
}
