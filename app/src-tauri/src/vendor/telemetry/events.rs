use embroiderly_parsers::PatternFormat;
use embroiderly_pattern::{
  DisplayMode, Fabric, Grid, LayersVisibility, PaletteSettings, PdfExportOptions, ReferenceImageSettings,
};

use crate::core::actions::SortPaletteBy;

/// Represents all telemetry events that can occur in the application.
pub enum AppEvent {
  AppStarted,
  AppExited,

  PatternCreated {
    fabric: Fabric,
  },
  PatternOpened {
    format: PatternFormat,
    fabric: Fabric,

    palette_size: usize,
    blends_number: usize,
    used_palette_brands: Vec<String>,
    used_stitch_fonts: Vec<String>,

    full_stitches_number: usize,
    petite_stitches_number: usize,
    half_stitches_number: usize,
    quarter_stitches_number: usize,
    back_stitches_number: usize,
    straight_stitches_number: usize,
    french_knots_number: usize,
    beads_number: usize,
    special_stitches_number: usize,

    has_reference_image: bool,
    reference_image_format: Option<image::ImageFormat>,
    reference_image_dimensions: Option<(u32, u32)>,
    reference_image_size: Option<usize>,
  },
  PatternSaved {
    format: PatternFormat,
  },
  PatternClosed,

  PatternExportedAsPdf {
    settings: PdfExportOptions,
  },
  PdfExportSettingsUpdated {
    settings: PdfExportOptions,
  },

  ReferenceImageSet {
    format: image::ImageFormat,
    dimensions: (u32, u32),
    size: usize,
  },
  ReferenceImageRemoved,
  ReferenceImageSettingsUpdated {
    settings: ReferenceImageSettings,
  },

  PaletteItemAdded {
    brand: String,
    is_blend: bool,
    blends_number: Option<usize>,
  },
  PaletteItemRemoved {
    brand: String,
    is_blend: bool,
    blends_number: Option<usize>,
  },
  PaletteDisplaySettingsUpdated {
    settings: PaletteSettings,
  },
  PaletteSorted {
    sort_by: SortPaletteBy,
    palette_size: usize,
    blends_number: usize,
    used_palette_brands: Vec<String>,
  },

  FabricUpdated {
    fabric: Fabric,
  },
  GridUpdated {
    grid: Grid,
  },

  DisplayModeChanged {
    mode: DisplayMode,
  },
  SymbolsVisibilityChanged {
    visible: bool,
  },
  LayersVisibilityChanged {
    visibility: LayersVisibility,
  },

  PalettesImported {
    total_files: usize,
    failed_files: usize,
  },
  SymbolFontsImported {
    total_files: usize,
    failed_files: usize,
  },
}

impl tauri_plugin_posthog::ToPostHogEvent for AppEvent {
  fn event_name(&self) -> &str {
    match self {
      Self::AppStarted => "app_started",
      Self::AppExited => "app_exited",

      Self::PatternCreated { .. } => "pattern_created",
      Self::PatternOpened { .. } => "pattern_opened",
      Self::PatternSaved { .. } => "pattern_saved",
      Self::PatternClosed => "pattern_closed",

      Self::PatternExportedAsPdf { .. } => "pattern_exported_as_pdf",
      Self::PdfExportSettingsUpdated { .. } => "pdf_export_settings_updated",

      Self::ReferenceImageSet { .. } => "reference_image_set",
      Self::ReferenceImageRemoved => "reference_image_removed",
      Self::ReferenceImageSettingsUpdated { .. } => "reference_image_settings_updated",

      Self::PaletteItemAdded { .. } => "palette_item_added",
      Self::PaletteItemRemoved { .. } => "palette_item_removed",
      Self::PaletteDisplaySettingsUpdated { .. } => "palette_display_settings_updated",
      Self::PaletteSorted { .. } => "palette_sorted",

      Self::FabricUpdated { .. } => "fabric_updated",
      Self::GridUpdated { .. } => "grid_updated",

      Self::DisplayModeChanged { .. } => "display_mode_changed",
      Self::SymbolsVisibilityChanged { .. } => "symbols_visibility_changed",
      Self::LayersVisibilityChanged { .. } => "layers_visibility_changed",

      Self::PalettesImported { .. } => "palettes_imported",
      Self::SymbolFontsImported { .. } => "symbol_fonts_imported",
    }
  }

  fn properties(&self) -> std::collections::HashMap<String, serde_json::Value> {
    use serde_json::json;

    match self {
      Self::PatternCreated { fabric } => vec![
        ("fabric_dimensions", json!((fabric.width, fabric.height))),
        ("fabric_spi", json!(fabric.spi)),
        ("fabric_kind", json!(fabric.kind)),
        ("fabric_color", json!(fabric.color)),
      ],
      Self::PatternOpened {
        format,
        fabric,
        palette_size,
        blends_number,
        used_palette_brands,
        used_stitch_fonts,
        full_stitches_number,
        petite_stitches_number,
        half_stitches_number,
        quarter_stitches_number,
        back_stitches_number,
        straight_stitches_number,
        french_knots_number,
        beads_number,
        special_stitches_number,
        has_reference_image,
        reference_image_format,
        reference_image_dimensions,
        reference_image_size,
      } => vec![
        ("format", json!(format.to_string())),
        (
          "fabric_dimensions",
          json!(format!("{}x{}", fabric.width, fabric.height)),
        ),
        ("fabric_spi", json!(format!("{}x{}", fabric.spi.0, fabric.spi.1))),
        ("fabric_kind", json!(fabric.kind)),
        ("fabric_color", json!(fabric.color)),
        ("palette_size", json!(palette_size)),
        ("blends_number", json!(blends_number)),
        ("used_palette_brands", json!(used_palette_brands)),
        ("used_stitch_fonts", json!(used_stitch_fonts)),
        ("full_stitches_number", json!(full_stitches_number)),
        ("petite_stitches_number", json!(petite_stitches_number)),
        ("half_stitches_number", json!(half_stitches_number)),
        ("quarter_stitches_number", json!(quarter_stitches_number)),
        ("back_stitches_number", json!(back_stitches_number)),
        ("straight_stitches_number", json!(straight_stitches_number)),
        ("french_knots_number", json!(french_knots_number)),
        ("beads_number", json!(beads_number)),
        ("special_stitches_number", json!(special_stitches_number)),
        ("has_reference_image", json!(has_reference_image)),
        (
          "reference_image_format",
          json!(reference_image_format.map(|format| image::ImageFormat::extensions_str(format)[0])),
        ),
        (
          "reference_image_dimensions",
          json!(reference_image_dimensions.map(|(w, h)| format!("{w}x{h}"))),
        ),
        ("reference_image_size", json!(reference_image_size)),
      ],
      Self::PatternSaved { format } => vec![("format", json!(format.to_string()))],

      Self::PatternExportedAsPdf { settings } | Self::PdfExportSettingsUpdated { settings } => vec![
        ("export_monochrome", json!(settings.monochrome)),
        ("export_color", json!(settings.color)),
        ("center_frames", json!(settings.center_frames)),
        ("enumerate_frames", json!(settings.enumerate_frames)),
        (
          "frame_size",
          json!(settings.frame_options.frame_size.map(|(w, h)| format!("{w}x{h}"))),
        ),
        ("cell_size", json!(settings.frame_options.cell_size)),
        ("preserved_overlap", json!(settings.frame_options.preserved_overlap)),
        (
          "show_grid_line_numbers",
          json!(settings.frame_options.show_grid_line_numbers),
        ),
        (
          "show_centering_marks",
          json!(settings.frame_options.show_centering_marks),
        ),
      ],

      Self::ReferenceImageSet { format, dimensions, size } => vec![
        ("format", json!(image::ImageFormat::extensions_str(*format)[0])),
        ("dimensions", json!(format!("{}x{}", dimensions.0, dimensions.1))),
        ("size", json!(size)),
      ],
      Self::ReferenceImageSettingsUpdated { settings } => vec![
        ("x", json!(settings.x)),
        ("y", json!(settings.y)),
        ("width", json!(settings.width)),
        ("height", json!(settings.height)),
        ("rotation", json!(settings.rotation)),
        ("opactity", json!(settings.opacity)),
      ],

      Self::PaletteItemAdded { brand, is_blend, blends_number } => vec![
        ("brand", json!(brand)),
        ("is_blend", json!(is_blend)),
        ("blends_number", json!(blends_number)),
      ],
      Self::PaletteItemRemoved { brand, is_blend, blends_number } => vec![
        ("brand", json!(brand)),
        ("is_blend", json!(is_blend)),
        ("blends_number", json!(blends_number)),
      ],
      Self::PaletteDisplaySettingsUpdated { settings } => vec![
        ("columns_number", json!(settings.columns_number)),
        ("color_only", json!(settings.color_only)),
        ("show_color_brands", json!(settings.show_color_brands)),
        ("show_color_numbers", json!(settings.show_color_numbers)),
        ("show_color_names", json!(settings.show_color_names)),
      ],
      Self::PaletteSorted {
        sort_by,
        palette_size,
        blends_number,
        used_palette_brands,
      } => vec![
        ("sort_by", json!(sort_by)),
        ("palette_size", json!(palette_size)),
        ("blends_number", json!(blends_number)),
        ("used_palette_brands", json!(used_palette_brands)),
      ],

      Self::FabricUpdated { fabric } => vec![
        (
          "fabric_dimensions",
          json!(format!("{}x{}", fabric.width, fabric.height)),
        ),
        ("fabric_spi", json!(format!("{}x{}", fabric.spi.0, fabric.spi.1))),
        ("fabric_kind", json!(fabric.kind)),
        ("fabric_color", json!(fabric.color)),
      ],
      Self::GridUpdated { grid } => vec![
        ("major_lines_interval", json!(grid.major_lines_interval)),
        ("minor_lines_thickness", json!(grid.minor_lines.thickness)),
        ("minor_lines_color", json!(grid.minor_lines.color)),
        ("major_lines_thickness", json!(grid.major_lines.thickness)),
        ("major_lines_color", json!(grid.major_lines.color)),
      ],

      Self::DisplayModeChanged { mode } => vec![("display_mode", json!(mode.to_string()))],
      Self::SymbolsVisibilityChanged { visible } => vec![("symbols_visible", json!(visible))],
      Self::LayersVisibilityChanged { visibility } => vec![
        ("reference_image_visible", json!(visibility.reference_image)),
        ("full_stitches_visible", json!(visibility.fullstitches)),
        ("petite_stitches_visible", json!(visibility.petitestitches)),
        ("half_stitches_visible", json!(visibility.halfstitches)),
        ("quarter_stitches_visible", json!(visibility.quarterstitches)),
        ("back_stitches_visible", json!(visibility.backstitches)),
        ("straight_stitches_visible", json!(visibility.straightstitches)),
        ("french_knots_visible", json!(visibility.frenchknots)),
        ("beads_visible", json!(visibility.beads)),
        ("special_stitches_visible", json!(visibility.specialstitches)),
        ("grid_visible", json!(visibility.grid)),
        ("rulers_visible", json!(visibility.rulers)),
      ],

      Self::PalettesImported { total_files, failed_files } => vec![
        ("total_files", json!(total_files)),
        ("failed_files", json!(failed_files)),
      ],
      Self::SymbolFontsImported { total_files, failed_files } => vec![
        ("total_files", json!(total_files)),
        ("failed_files", json!(failed_files)),
      ],

      _ => vec![],
    }
    .into_iter()
    .map(|(k, v)| (k.to_string(), v))
    .collect()
  }
}
