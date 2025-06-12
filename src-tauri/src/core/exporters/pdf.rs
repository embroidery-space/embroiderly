use anyhow::Result;

use crate::core::pattern::*;

#[cfg(test)]
#[path = "pdf.test.rs"]
mod tests;

#[derive(askama::Template)]
#[template(path = "pattern.typ", escape = "txt")]
struct TypstPatternTemplate<'a> {
  info: &'a PatternInfo,
  fabric: &'a Fabric,
  palette: &'a Vec<PaletteItem>,
  default_symbol_font: &'a str,
}

pub fn export_pattern<P: AsRef<std::path::Path>>(
  patproj: &PatternProject,
  file_path: P,
  text_fonts: Vec<std::path::PathBuf>,
  symbol_fonts: Vec<std::path::PathBuf>,
) -> Result<()> {
  log::debug!("Exporting Pattern({:?}) to PDF", patproj.id);
  let file_path = file_path.as_ref();

  let PatternProject { pattern, display_settings, .. } = patproj;

  let text_fonts = text_fonts.iter().map(std::fs::read).collect::<Result<Vec<_>, _>>()?;
  let symbol_fonts = symbol_fonts.iter().map(std::fs::read).collect::<Result<Vec<_>, _>>()?;

  let typst_template = {
    use askama::Template as _;

    let template = TypstPatternTemplate {
      info: &pattern.info,
      fabric: &pattern.fabric,
      palette: &pattern.palette,
      default_symbol_font: &display_settings.default_symbol_font,
    };
    let template = template.render()?;

    typst_as_lib::TypstEngine::builder()
      .main_file(template)
      .fonts(text_fonts.into_iter().chain(symbol_fonts).collect::<Vec<_>>())
      .build()
  };

  let doc = {
    let result = typst_template.compile();
    for warning in &result.warnings {
      log::warn!("Typst compilation warning: {:?}", warning);
    }
    result.output?
  };

  let pdf_options = Default::default();
  let pdf_bytes =
    typst_pdf::pdf(&doc, &pdf_options).map_err(|warnings| anyhow::anyhow!("Failed to export PDF: {:?}", warnings))?;

  std::fs::write(file_path, pdf_bytes)?;

  log::debug!("Pattern({:?}) exported to PDF", patproj.id);
  Ok(())
}
