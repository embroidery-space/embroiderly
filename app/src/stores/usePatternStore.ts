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
  ReferenceImage,
  ReferenceImageSettings,
  serializeStitch,
} from "~/lib/pattern/";
import type { Stitch, Symbol } from "~/lib/pattern/";

export const usePatternStore = defineStore("embroiderly-pattern", () => {
  const { editor, events } = useEditor();

  const pattern = shallowRef(new Pattern());

  function setPattern(value?: Pattern) {
    pattern.value = value ?? new Pattern();
  }

  async function setReferenceImage(image: ReferenceImage) {
    if (pattern.value.isNil) return;
    const content = new Uint8Array(await image.arrayBuffer());
    const data = ReferenceImage.schema.serialize({ content, settings: image.settings });
    editor.setReferenceImage(pattern.value.id, data);
  }
  function removeReferenceImage() {
    if (pattern.value.isNil) return;
    editor.removeReferenceImage(pattern.value.id);
  }
  events.on("image:set", (image) => {
    pattern.value.referenceImage = image;
    triggerRef(pattern);
  });

  function updateReferenceImageSettings(settings: ReferenceImageSettings) {
    if (pattern.value.isNil) return;
    editor.updateReferenceImageSettings(pattern.value.id, ReferenceImageSettings.serialize(settings));
  }
  events.on("image:settings:update", (settings) => {
    if (pattern.value.referenceImage) pattern.value.referenceImage.settings = settings;
  });

  function updatePatternInfo(patternInfo: PatternInfo) {
    if (pattern.value.isNil) return;
    editor.updatePatternInfo(pattern.value.id, PatternInfo.serialize(patternInfo));
  }
  events.on("pattern-info:update", (info) => {
    pattern.value.info = info;
  });

  function updateFabric(fabric: Fabric) {
    if (pattern.value.isNil) return;
    editor.updateFabric(pattern.value.id, Fabric.serialize(fabric));
  }
  events.on("fabric:update", (fabric) => {
    pattern.value.fabric = fabric;
  });

  function updateGrid(grid: Grid) {
    if (pattern.value.isNil) return;
    editor.updateGrid(pattern.value.id, Grid.serialize(grid));
  }
  events.on("grid:update", (grid) => {
    pattern.value.grid = grid;
  });

  function addPaletteItem(palitem: PaletteItem) {
    if (pattern.value.isNil) return;
    editor.addPaletteItem(pattern.value.id, PaletteItem.serialize(palitem));
  }
  events.on("palette:add_palette_item", ({ palitem, palindex }) => {
    pattern.value.palette.insert(palindex, palitem);
    triggerRef(pattern);
  });

  function removePaletteItem(...paletteItemIndexes: number[]) {
    if (pattern.value.isNil) return;
    editor.removePaletteItems(pattern.value.id, new Uint32Array(paletteItemIndexes));
  }
  events.on("palette:remove_palette_item", (palindexes) => {
    for (const palindex of [...palindexes].reverse()) {
      pattern.value.palette.remove(palindex);
    }
    triggerRef(pattern);
  });

  function updatePaletteDisplaySettings(settings: PaletteSettings) {
    if (pattern.value.isNil) return;
    editor.updatePaletteDisplaySettings(pattern.value.id, PaletteSettings.serialize(settings));
  }
  events.on("palette:update_display_settings", (settings) => {
    pattern.value.paletteDisplaySettings = settings;
    triggerRef(pattern);
  });

  function sortPaletteBy(sortBy: SortPaletteBy) {
    if (pattern.value.isNil) return;
    editor.sortPalette(pattern.value.id, sortBy);
  }
  events.on("palette:sort", (positions) => {
    pattern.value.palette.positions = positions;
    triggerRef(pattern);
  });

  function reorderPaletteItems(oldPosition: number, newPosition: number) {
    if (pattern.value.isNil) return;
    editor.reorderPaletteItems(pattern.value.id, oldPosition, newPosition);
  }
  events.on("palette:reorder", (positions) => {
    pattern.value.palette.positions = positions;
    triggerRef(pattern);
  });

  function setPaletteItemSymbol(palindex: number, symbol?: Symbol) {
    if (pattern.value.isNil) return;
    editor.setPaletteItemSymbol(pattern.value.id, SetSymbolData.serialize({ palindex, symbol }));
  }
  events.on("palette:set_symbol", ({ palindex, symbol }) => {
    const item = pattern.value.palette.get(palindex);
    if (item) {
      item.symbol = symbol;
      triggerRef(pattern);
    }
  });

  function addLayer() {
    if (pattern.value.isNil) return;
    editor.addLayer(pattern.value.id);
  }
  function removeLayer(layerIndex: number) {
    if (pattern.value.isNil) return;
    editor.removeLayer(pattern.value.id, layerIndex);
  }
  function renameLayer(layerIndex: number, name: string) {
    if (pattern.value.isNil) return;
    editor.renameLayer(pattern.value.id, layerIndex, name);
  }
  function updateLayerVisibility(layerIndex: number, visibility: LayerVisibility) {
    if (pattern.value.isNil) return;
    editor.updateLayerVisibility(pattern.value.id, layerIndex, LayerVisibility.serialize(visibility));
  }
  function moveLayer(oldPosition: number, newPosition: number) {
    if (pattern.value.isNil) return;
    editor.moveLayer(pattern.value.id, oldPosition, newPosition);
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

  function addStitch(layerIndex: number, stitch: Stitch) {
    if (pattern.value.isNil) return;
    editor.addStitch(pattern.value.id, layerIndex, serializeStitch(stitch));
  }
  function removeStitch(layerIndex: number, stitch: Stitch) {
    if (pattern.value.isNil) return;
    editor.removeStitch(pattern.value.id, layerIndex, serializeStitch(stitch));
  }
  events.on("stitches:add", ({ layerIndex, stitches }) => {
    for (const stitch of stitches) pattern.value.addStitch(layerIndex, stitch);
  });
  events.on("stitches:remove", ({ layerIndex, stitches }) => {
    for (const stitch of stitches) pattern.value.removeStitch(layerIndex, stitch);
  });

  function updateDisplaySettings(settings: DisplaySettings) {
    if (pattern.value.isNil) return;
    editor.updateDisplaySettings(pattern.value.id, DisplaySettings.serialize(settings));
  }
  events.on("display:update", (settings) => {
    pattern.value.displaySettings = settings;
    triggerRef(pattern);
  });

  function setDisplayMode(mode: DisplayMode | undefined) {
    if (pattern.value.isNil) return;
    if (mode === undefined || mode === pattern.value.displayMode) {
      pattern.value.displayMode = mode;
      return triggerRef(pattern);
    }
    return updateDisplaySettings(new DisplaySettings({ ...pattern.value.displaySettings, displayMode: mode }));
  }

  function showSymbols(value: boolean) {
    if (pattern.value.isNil) return;
    return updateDisplaySettings(new DisplaySettings({ ...pattern.value.displaySettings, showSymbols: value }));
  }

  function showGrid(value: boolean) {
    if (pattern.value.isNil) return;
    return updateDisplaySettings(new DisplaySettings({ ...pattern.value.displaySettings, showGrid: value }));
  }

  function showRulers(value: boolean) {
    if (pattern.value.isNil) return;
    return updateDisplaySettings(new DisplaySettings({ ...pattern.value.displaySettings, showRulers: value }));
  }

  function updatePdfExportOptions(options: PdfExportOptions) {
    if (pattern.value.isNil) return;
    editor.updatePdfExportOptions(pattern.value.id, PdfExportOptions.serialize(options));
  }
  events.on("publish:update-pdf", (options) => {
    pattern.value.pdfExportOptions = options;
  });

  function undo(options?: { single?: boolean }) {
    if (pattern.value.isNil) return;
    if (options?.single) editor.undo(pattern.value.id);
    else editor.undoTransaction(pattern.value.id);
  }

  function redo(options?: { single?: boolean }) {
    if (pattern.value.isNil) return;
    if (options?.single) editor.redo(pattern.value.id);
    else editor.redoTransaction(pattern.value.id);
  }

  function startTransaction() {
    if (pattern.value.isNil) return;
    editor.startTransaction(pattern.value.id);
  }

  function endTransaction() {
    if (pattern.value.isNil) return;
    editor.endTransaction(pattern.value.id);
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
