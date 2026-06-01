import { posthog } from "posthog-js/dist/module.slim.js";
import type { PostHog, EventName, Properties } from "posthog-js/dist/module.slim.js";
import { sampleByEvent } from "posthog-js/lib/src/customizations/before-send.js";

import type {
  DisplaySettings,
  Fabric,
  Grid,
  LayerVisibility,
  Palette,
  PaletteItem,
  PaletteSettings,
  Pattern,
  PatternInfo,
  PdfExportOptions,
  ReferenceImageSettings,
  SortPaletteBy,
  Symbol,
} from "~/lib/pattern/";

class MetricsServiceClass {
  #client?: PostHog;

  constructor() {
    if (!import.meta.env.VITE_EMBROIDERLY_POSTHOG_API_KEY) return;

    this.#client = posthog.init(import.meta.env.VITE_EMBROIDERLY_POSTHOG_API_KEY, {
      api_host: import.meta.env.DEV ? "/usage" : "https://embroiderly.niusia.me/usage",

      // Always start opted-out.
      // The client is enabled in `App.vue` based on the user preferences.
      opt_out_capturing_by_default: true,

      // Disable web navigation capturing (we track sessions manually).
      capture_pageview: false,
      capture_pageleave: false,

      // Disable auto capturing.
      autocapture: false,
      rageclick: false,
      capture_dead_clicks: false,
      capture_exceptions: false, // We use Sentry for capturing errors.
      capture_heatmaps: false,
      capture_performance: false,

      // Disable marketing features.
      save_referrer: false,
      save_campaign_params: false,
      cross_subdomain_cookie: false,

      // Disable loading of remote configs.
      disable_external_dependency_loading: true,

      // Disable extra features (currently, we do not use them).
      disable_surveys: true,
      disable_session_recording: true,
      disable_scroll_properties: true,
      disable_web_experiments: true,
      enable_recording_console_log: false,
      enable_heatmaps: false,

      // Disable `/flags`-dependent features.
      advanced_enable_surveys: false,
      advanced_disable_flags: true,
      advanced_disable_feature_flags: true,
      advanced_disable_toolbar_metrics: true,
      advanced_disable_feature_flags_on_first_load: true,
      advanced_only_evaluate_survey_feature_flags: true,

      before_send: [sampleByEvent(["stitch_added", "stitch_removed"], 0.001)],
    });

    this.#client.register({
      app_version: __APP_VERSION__,
      runtime: __TAURI__ ? "tauri" : "web",
    });
  }

  get enabled(): boolean {
    return !this.#client?.has_opted_out_capturing();
  }
  set enabled(value: boolean) {
    if (value) this.#client?.opt_in_capturing({ captureEventName: false });
    else this.#client?.opt_out_capturing();
  }

  #capture(event: EventName, properties?: Properties) {
    this.#client?.capture(event, properties);
  }

  captureAppStarted() {
    this.#capture("app_started");
  }

  captureAppExited() {
    this.#capture("app_exited");
  }

  capturePatternOpened(pattern: Pattern, format?: string) {
    const { palette, fabric } = pattern;

    let full_stitches_number = 0;
    let petite_stitches_number = 0;
    let half_stitches_number = 0;
    let quarter_stitches_number = 0;
    let back_stitches_number = 0;
    let straight_stitches_number = 0;
    let french_knots_number = 0;
    let beads_number = 0;
    let special_stitches_number = 0;
    for (const layer of pattern.layers.items) {
      const counts = layer.stitchCounts();
      full_stitches_number += counts.fullStitches;
      petite_stitches_number += counts.petiteStitches;
      half_stitches_number += counts.halfStitches;
      quarter_stitches_number += counts.quarterStitches;
      back_stitches_number += counts.backStitches;
      straight_stitches_number += counts.straightStitches;
      french_knots_number += counts.frenchKnots;
      beads_number += counts.beads;
      special_stitches_number += counts.specialStitches;
    }

    this.#capture("pattern_opened", {
      format,

      fabric_size: [fabric.width, fabric.height],
      fabric_spi: fabric.spi,
      fabric_kind: fabric.kind,
      fabric_color: fabric.color.toHex().toUpperCase(),

      palette_size: palette.length,
      blends_number: palette.blendsNumber,
      used_palette_brands: palette.usedBrands,
      used_stitch_fonts: palette.usedSymbolFonts,

      layers_number: pattern.layers.length,
      full_stitches_number,
      petite_stitches_number,
      half_stitches_number,
      quarter_stitches_number,
      back_stitches_number,
      straight_stitches_number,
      french_knots_number,
      beads_number,
      special_stitches_number,

      has_reference_image: pattern.referenceImage !== undefined,
      reference_image_size: pattern.referenceImage?.size ?? null,
      reference_image_mime_type: pattern.referenceImage?.type ?? null,
    });
  }

  capturePatternCreated(fabric: Fabric) {
    this.#capture("pattern_created", {
      fabric_size: [fabric.width, fabric.height],
      fabric_spi: fabric.spi,
      fabric_kind: fabric.kind,
      fabric_color: fabric.color.toHex().toUpperCase(),
    });
  }

  capturePatternSaved(format = "embproj") {
    this.#capture("pattern_saved", { format });
  }

  capturePatternClosed() {
    this.#capture("pattern_closed");
  }

  capturePatternExportedAsPdf(options: PdfExportOptions) {
    this.#capture("pattern_exported_as_pdf", this.#pdfExportProperties(options));
  }

  capturePdfExportOptionsUpdated(options: PdfExportOptions) {
    this.#capture("pdf_export_settings_updated", this.#pdfExportProperties(options));
  }

  #pdfExportProperties(options: PdfExportOptions) {
    const { frameOptions } = options;
    return {
      center_frames: options.centerFrames,
      enumerate_frames: options.enumerateFrames,
      frame_size: frameOptions.frameSize ? [frameOptions.frameSize[0], frameOptions.frameSize[1]] : null,
      cell_size: frameOptions.cellSize,
      preserved_overlap: frameOptions.preservedOverlap,
      show_grid_line_numbers: frameOptions.showGridLineNumbers,
      show_centering_marks: frameOptions.showCenteringMarks,
    };
  }

  captureReferenceImageSet(file: File) {
    this.#capture("reference_image_set", {
      size: file.size,
      mime_type: file.type,
    });
  }

  captureReferenceImageRemoved() {
    this.#capture("reference_image_removed");
  }

  captureReferenceImageSettingsUpdated(settings: ReferenceImageSettings) {
    this.#capture("reference_image_settings_updated", {
      x: settings.x,
      y: settings.y,
      width: settings.width,
      height: settings.height,
      rotation: settings.rotation,
      opacity: settings.opacity,
    });
  }

  capturePatternInfoUpdated(info: PatternInfo) {
    this.#capture("pattern_info_updated", {
      title_set: !!info.title,
      author_set: !!info.author,
      copyright_set: !!info.copyright,
      description_set: !!info.description,
    });
  }

  captureFabricUpdated(fabric: Fabric) {
    this.#capture("fabric_updated", {
      fabric_size: [fabric.width, fabric.height],
      fabric_spi: fabric.spi,
      fabric_kind: fabric.kind,
      fabric_color: fabric.color.toHex().toUpperCase(),
    });
  }

  captureGridUpdated(grid: Grid) {
    this.#capture("grid_updated", {
      major_lines_interval: grid.majorLinesInterval,
      minor_lines_thickness: grid.minorLines.thickness,
      minor_lines_color: grid.minorLines.color,
      major_lines_thickness: grid.majorLines.thickness,
      major_lines_color: grid.majorLines.color,
    });
  }

  captureDisplaySettingsUpdated(settings: DisplaySettings) {
    this.#capture("display_settings_updated", {
      display_mode: settings.displayMode,
      symbols_visible: settings.showSymbols,
      grid_visible: settings.showGrid,
      rulers_visible: settings.showRulers,
    });
  }

  capturePaletteItemAdded(item: PaletteItem) {
    this.#capture("palette_item_added", {
      brand: item.brand,
      is_blend: !!item.blends?.length,
      blends_number: item.blends?.length ?? null,
    });
  }

  capturePaletteItemsRemoved(items: PaletteItem[]) {
    for (const item of items) {
      this.#capture("palette_item_removed", {
        brand: item.brand,
        is_blend: !!item.blends?.length,
        blends_number: item.blends?.length ?? null,
      });
    }
  }

  capturePaletteDisplaySettingsUpdated(settings: PaletteSettings) {
    this.#capture("palette_display_settings_updated", {
      columns_number: settings.columnsNumber,
      color_only: settings.colorOnly,
      show_color_brands: settings.showColorBrands,
      show_color_numbers: settings.showColorNumbers,
      show_color_names: settings.showColorNames,
    });
  }

  capturePaletteSorted(sortBy: SortPaletteBy, palette: Palette) {
    this.#capture("palette_sorted", {
      sort_by: sortBy,
      palette_size: palette.length,
      blends_number: palette.blendsNumber,
      used_palette_brands: palette.usedBrands,
    });
  }

  capturePaletteItemsReordered() {
    this.#capture("palette_items_reordered");
  }

  capturePaletteItemSymbolSet(symbol?: Symbol) {
    if (symbol) this.#capture("palette_item_symbol_set", { symbol_font: symbol.font });
    else this.#capture("palette_item_symbol_removed");
  }

  captureLayerAdded() {
    this.#capture("layer_added");
  }

  captureLayerRemoved() {
    this.#capture("layer_removed");
  }

  captureLayerRenamed() {
    this.#capture("layer_renamed");
  }

  captureLayerVisibilityUpdated(visibility: LayerVisibility) {
    this.#capture("layer_visibility_updated", {
      visible: visibility.visible,

      fullstitches_visible: visibility.fullstitchesVisible,
      petitestitches_visible: visibility.petitestitchesVisible,

      halfstitches_visible: visibility.halfstitchesVisible,
      quarterstitches_visible: visibility.quarterstitchesVisible,

      backstitches_visible: visibility.backstitchesVisible,
      straightstitches_visible: visibility.straightstitchesVisible,

      frenchknots_visible: visibility.frenchknotsVisible,
      beads_visible: visibility.beadsVisible,

      specialstitches_visible: visibility.specialstitchesVisible,
    });
  }

  captureLayerMoved() {
    this.#capture("layer_moved");
  }

  captureStitchAdded(kind: string) {
    this.#capture("stitch_added", { kind });
  }

  captureStitchRemoved(kind: string) {
    this.#capture("stitch_removed", { kind });
  }

  capturePalettesImported(paletteFileNames: string[], failedFiles: number) {
    this.#capture("palettes_imported", {
      palette_file_names: paletteFileNames,
      total_files: paletteFileNames.length,
      failed_files: failedFiles,
    });
  }

  captureSymbolFontsImported(symbolFontFileNames: string[], failedFiles: number) {
    this.#capture("symbol_fonts_imported", {
      symbol_font_file_names: symbolFontFileNames,
      total_files: symbolFontFileNames.length,
      failed_files: failedFiles,
    });
  }

  captureUiChanged(theme: string, scale: string, language: string) {
    this.#capture("ui_changed", { theme, scale, language });
  }

  /** Captures the offering of a tour. */
  captureTourOffered() {
    this.#capture("tour_offered");
  }

  /** Captures the starting of a tour. */
  captureTourStarted() {
    this.#capture("tour_started");
  }

  /** Captures the skipping of a tour. */
  captureTourSkipped() {
    this.#capture("tour_skipped");
  }

  /**
   * Captures the completion of a tour.
   * @param duration The duration of the tour in milliseconds.
   */
  captureTourCompleted(duration: number) {
    this.#capture("tour_completed", { duration });
  }

  /**
   * Captures the cancellation of a tour.
   * @param step The step at which the tour was cancelled.
   */
  captureTourCancelled(step: string) {
    this.#capture("tour_cancelled", { step });
  }
}
export const MetricsService = new MetricsServiceClass();
