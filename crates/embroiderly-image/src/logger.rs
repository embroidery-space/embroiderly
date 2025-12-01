use embroiderly_logger::APPLICATION_LOG_LEVEL;

/// Initializes the logger.
pub fn init() -> anyhow::Result<()> {
  let dispatch = embroiderly_logger::init_sidecar_logger("embroiderly_image")?
    .level_for("embroiderly_image", APPLICATION_LOG_LEVEL.to_level_filter());
  dispatch.apply()?;

  Ok(())
}
