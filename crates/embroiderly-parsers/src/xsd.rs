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
    palette: {
      let mut palette = xsd_pattern
        .palette
        .into_iter()
        .map(|palitem| palitem.into())
        .collect::<Vec<_>>();

      for (i, (symbols, formats)) in xsd_pattern.symbols.iter().zip(xsd_pattern.formats.iter()).enumerate() {
        let palitem: &mut PaletteItem = palette.get_mut(i).unwrap();

        palitem.symbol_font = formats.font.font_name.clone();
        if let Some(code) = symbols.full {
          palitem.symbol = Some(char::try_from(code as u32)?);
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
    default_symbol_font: xsd_pattern.pattern_settings.default_stitch_font,
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
