import { defineStore } from "pinia";
import { shallowRef, triggerRef } from "vue";

import { useEditor } from "~/composables";
import {
  Pattern,
  Fabric,
  Grid,
  LayerVisibility,
  PaletteItem,
  PaletteSettings,
  SortPaletteBy,
  SetSymbolData,
  DisplayMode,
  DisplaySettings,
  PdfExportOptions,
  PatternInfo,
  ReferenceImageSettings,
  serializeStitch,
} from "~/lib/pattern/";
import type { Stitch, Symbol } from "~/lib/pattern/";
import { MetricsService } from "~/services";

export const usePatternStore = defineStore("embroiderly-pattern", () => {
  const { editor, events } = useEditor();

  const pattern = shallowRef(new Pattern());

  function setPattern(value?: Pattern) {
    pattern.value = value ?? new Pattern();
  }

  async function setReferenceImage(image: File) {
    if (pattern.value.isNil) return;
    await editor.setReferenceImage(pattern.value.id, new Uint8Array(await image.arrayBuffer()));
    MetricsService.captureReferenceImageSet(image);
  }
  async function removeReferenceImage() {
    if (pattern.value.isNil) return;
    await editor.removeReferenceImage(pattern.value.id);
    MetricsService.captureReferenceImageRemoved();
  }
  events.on("image:set", (image) => {
    pattern.value.referenceImage = image;
    triggerRef(pattern);
  });

  async function updateReferenceImageSettings(settings: ReferenceImageSettings) {
    if (pattern.value.isNil) return;
    await editor.updateReferenceImageSettings(pattern.value.id, ReferenceImageSettings.serialize(settings));
    MetricsService.captureReferenceImageSettingsUpdated(settings);
  }
  events.on("image:settings:update", (settings) => {
    if (pattern.value.referenceImage) pattern.value.referenceImage.settings = settings;
  });

  async function updatePatternInfo(patternInfo: PatternInfo) {
    if (pattern.value.isNil) return;
    await editor.updatePatternInfo(pattern.value.id, PatternInfo.serialize(patternInfo));
    MetricsService.capturePatternInfoUpdated(patternInfo);
  }
  events.on("pattern-info:update", (info) => {
    pattern.value.info = info;
  });

  async function updateFabric(fabric: Fabric) {
    if (pattern.value.isNil) return;
    await editor.updateFabric(pattern.value.id, Fabric.serialize(fabric));
    MetricsService.captureFabricUpdated(fabric);
  }
  events.on("fabric:update", (fabric) => {
    pattern.value.fabric = fabric;
  });

  async function updateGrid(grid: Grid) {
    if (pattern.value.isNil) return;
    await editor.updateGrid(pattern.value.id, Grid.serialize(grid));
    MetricsService.captureGridUpdated(grid);
  }
  events.on("grid:update", (grid) => {
    pattern.value.grid = grid;
  });

  async function addPaletteItem(palitem: PaletteItem) {
    if (pattern.value.isNil) return;
    await editor.addPaletteItem(pattern.value.id, PaletteItem.serialize(palitem));
    MetricsService.capturePaletteItemAdded(palitem);
  }
  events.on("palette:add_palette_item", ({ palitem, palindex }) => {
    pattern.value.palette.insert(palindex, palitem);
    triggerRef(pattern);
  });

  async function removePaletteItem(...paletteItemIndexes: number[]) {
    if (pattern.value.isNil) return;
    const removedItems = paletteItemIndexes
      .map((idx) => pattern.value.palette.get(idx))
      .filter((item): item is PaletteItem => item !== undefined);
    await editor.removePaletteItems(pattern.value.id, new Uint32Array(paletteItemIndexes));
    MetricsService.capturePaletteItemsRemoved(removedItems);
  }
  events.on("palette:remove_palette_item", (palindexes) => {
    for (const palindex of [...palindexes].reverse()) {
      pattern.value.palette.remove(palindex);
    }
    triggerRef(pattern);
  });

  async function updatePaletteDisplaySettings(settings: PaletteSettings) {
    if (pattern.value.isNil) return;
    await editor.updatePaletteDisplaySettings(pattern.value.id, PaletteSettings.serialize(settings));
    MetricsService.capturePaletteDisplaySettingsUpdated(settings);
  }
  events.on("palette:update_display_settings", (settings) => {
    pattern.value.paletteDisplaySettings = settings;
    triggerRef(pattern);
  });

  async function sortPaletteBy(sortBy: SortPaletteBy) {
    if (pattern.value.isNil) return;
    await editor.sortPalette(pattern.value.id, sortBy);
    MetricsService.capturePaletteSorted(sortBy, pattern.value.palette);
  }
  events.on("palette:sort", (positions) => {
    pattern.value.palette.positions = positions;
    triggerRef(pattern);
  });

  async function reorderPaletteItems(oldPosition: number, newPosition: number) {
    if (pattern.value.isNil) return;
    await editor.reorderPaletteItems(pattern.value.id, oldPosition, newPosition);
    MetricsService.capturePaletteItemsReordered();
  }
  events.on("palette:reorder", (positions) => {
    pattern.value.palette.positions = positions;
    triggerRef(pattern);
  });

  async function setPaletteItemSymbol(palindex: number, symbol?: Symbol) {
    if (pattern.value.isNil) return;
    await editor.setPaletteItemSymbol(pattern.value.id, SetSymbolData.serialize({ palindex, symbol }));
    MetricsService.capturePaletteItemSymbolSet(symbol);
  }
  events.on("palette:set_symbol", ({ palindex, symbol }) => {
    const item = pattern.value.palette.get(palindex);
    if (item) {
      item.symbol = symbol;
      triggerRef(pattern);
    }
  });

  async function addLayer() {
    if (pattern.value.isNil) return;
    await editor.addLayer(pattern.value.id);
    MetricsService.captureLayerAdded();
  }
  async function removeLayer(layerIndex: number) {
    if (pattern.value.isNil) return;
    await editor.removeLayer(pattern.value.id, layerIndex);
    MetricsService.captureLayerRemoved();
  }
  async function renameLayer(layerIndex: number, name: string) {
    if (pattern.value.isNil) return;
    await editor.renameLayer(pattern.value.id, layerIndex, name);
    MetricsService.captureLayerRenamed();
  }
  async function updateLayerVisibility(layerIndex: number, visibility: LayerVisibility) {
    if (pattern.value.isNil) return;
    await editor.updateLayerVisibility(pattern.value.id, layerIndex, LayerVisibility.serialize(visibility));
    MetricsService.captureLayerVisibilityUpdated(visibility);
  }
  async function moveLayer(oldPosition: number, newPosition: number) {
    if (pattern.value.isNil) return;
    await editor.moveLayer(pattern.value.id, oldPosition, newPosition);
    MetricsService.captureLayerMoved();
  }
  events.on("layers:add", ({ index, layer }) => {
    pattern.value.insertLayer(index, layer);
    triggerRef(pattern);
  });
  events.on("layers:remove", (layerIndex) => {
    pattern.value.removeLayer(layerIndex);
    triggerRef(pattern);
  });
  events.on("layers:rename", ({ layerIndex, name }) => {
    const layer = pattern.value.layers.get(layerIndex);
    if (layer) layer.name = name;
    triggerRef(pattern);
  });
  events.on("layers:update_visibility", ({ layerIndex, visibility }) => {
    pattern.value.updateLayerVisibility(layerIndex, visibility);
    triggerRef(pattern);
  });
  events.on("layers:move", (positions) => {
    pattern.value.moveLayer(positions);
    triggerRef(pattern);
  });

  async function addStitch(layerIndex: number, stitch: Stitch) {
    if (pattern.value.isNil) return;
    await editor.addStitch(pattern.value.id, layerIndex, serializeStitch(stitch));
    MetricsService.captureStitchAdded(stitch.kind);
  }
  async function removeStitch(layerIndex: number, stitch: Stitch) {
    if (pattern.value.isNil) return;
    await editor.removeStitch(pattern.value.id, layerIndex, serializeStitch(stitch));
    MetricsService.captureStitchRemoved(stitch.kind);
  }
  events.on("stitches:add", ({ layerIndex, stitches }) => {
    for (const stitch of stitches) pattern.value.addStitch(layerIndex, stitch);
  });
  events.on("stitches:remove", ({ layerIndex, stitches }) => {
    for (const stitch of stitches) pattern.value.removeStitch(layerIndex, stitch);
  });

  async function updateDisplaySettings(settings: DisplaySettings) {
    if (pattern.value.isNil) return;
    await editor.updateDisplaySettings(pattern.value.id, DisplaySettings.serialize(settings));
    MetricsService.captureDisplaySettingsUpdated(settings);
  }
  events.on("display:update", (settings) => {
    pattern.value.displaySettings = settings;
    triggerRef(pattern);
  });

  async function setDisplayMode(mode: DisplayMode | undefined) {
    if (pattern.value.isNil) return;
    if (mode === undefined || mode === pattern.value.displayMode) {
      pattern.value.displayMode = mode;
      return triggerRef(pattern);
    }
    return await updateDisplaySettings(new DisplaySettings({ ...pattern.value.displaySettings, displayMode: mode }));
  }

  async function showSymbols(value: boolean) {
    if (pattern.value.isNil) return;
    return await updateDisplaySettings(new DisplaySettings({ ...pattern.value.displaySettings, showSymbols: value }));
  }

  async function showGrid(value: boolean) {
    if (pattern.value.isNil) return;
    return await updateDisplaySettings(new DisplaySettings({ ...pattern.value.displaySettings, showGrid: value }));
  }

  async function showRulers(value: boolean) {
    if (pattern.value.isNil) return;
    return await updateDisplaySettings(new DisplaySettings({ ...pattern.value.displaySettings, showRulers: value }));
  }

  async function updatePdfExportOptions(options: PdfExportOptions) {
    if (pattern.value.isNil) return;
    await editor.updatePdfExportOptions(pattern.value.id, PdfExportOptions.serialize(options));
    MetricsService.capturePdfExportOptionsUpdated(options);
  }
  events.on("publish:update-pdf", (options) => {
    pattern.value.pdfExportOptions = options;
  });

  async function undo(options?: { single?: boolean }) {
    if (pattern.value.isNil) return;
    await editor.undo(pattern.value.id, options?.single ?? false);
  }

  async function redo(options?: { single?: boolean }) {
    if (pattern.value.isNil) return;
    await editor.redo(pattern.value.id, options?.single ?? false);
  }

  async function startTransaction() {
    if (pattern.value.isNil) return;
    await editor.startTransaction(pattern.value.id);
  }

  async function endTransaction() {
    if (pattern.value.isNil) return;
    await editor.endTransaction(pattern.value.id);
  }

  return {
    pattern,
    setPattern,
    setReferenceImage,
    removeReferenceImage,
    updateReferenceImageSettings,
    updatePatternInfo,
    updateFabric,
    updateGrid,
    addLayer,
    removeLayer,
    renameLayer,
    updateLayerVisibility,
    moveLayer,
    addPaletteItem,
    removePaletteItem,
    updatePaletteDisplaySettings,
    sortPaletteBy,
    reorderPaletteItems,
    setPaletteItemSymbol,
    addStitch,
    removeStitch,
    updateDisplaySettings,
    setDisplayMode,
    showSymbols,
    showGrid,
    showRulers,
    updatePdfExportOptions,
    undo,
    redo,
    startTransaction,
    endTransaction,
  };
});
