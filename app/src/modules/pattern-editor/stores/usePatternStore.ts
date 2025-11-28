import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { defineStore } from "pinia";
import { shallowRef, triggerRef } from "vue";

import {
  PatternEvent,
  ReferenceImage,
  ReferenceImageSettings,
  Pattern,
  Fabric,
  Grid,
  PaletteItem,
  AddedPaletteItemData,
  PaletteSettings,
  SortPaletteBy,
  Symbol,
  SetSymbolData,
  DisplayMode,
  LayersVisibility,
  PdfExportOptions,
  PatternInfo,
  deserializeStitches,
} from "~/modules/pattern-editor/lib/pattern/";
import type { Stitch } from "~/modules/pattern-editor/lib/pattern/";

import { PatternApi } from "../api/";

export const usePatternStore = defineStore(
  "embroiderly-pattern",
  () => {
    const appWindow = getCurrentWebviewWindow();

    const pattern = shallowRef<Pattern>();

    async function setReferenceImage(path: string) {
      if (!pattern.value) return;
      await PatternApi.setReferenceImage(pattern.value.id, path);
    }
    async function removeReferenceImage() {
      if (!pattern.value) return;
      await PatternApi.removeReferenceImage(pattern.value.id);
    }
    appWindow.listen<string>("image:set", ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.referenceImage = ReferenceImage.deserialize(payload);
      triggerRef(pattern);
    });

    async function updateReferenceImageSettings(settings: ReferenceImageSettings) {
      if (!pattern.value) return;
      await PatternApi.updateReferenceImageSettings(pattern.value.id, settings);
    }
    appWindow.listen<string>(PatternEvent.UpdateReferenceImageSettings, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.referenceImageSettings = ReferenceImageSettings.deserialize(payload);
    });

    async function updatePatternInfo(patternInfo: PatternInfo) {
      if (!pattern.value) return;
      await PatternApi.updatePatternInfo(pattern.value.id, patternInfo);
    }
    appWindow.listen<string>(PatternEvent.UpdatePatternInfo, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.info = PatternInfo.deserialize(payload);
      // appStateStore.updateOpenedPattern(pattern.value.id, pattern.value.info.title);
    });

    async function updateFabric(fabric: Fabric) {
      if (!pattern.value) return;
      await PatternApi.updateFabric(pattern.value.id, fabric);
    }
    appWindow.listen<string>(PatternEvent.UpdateFabric, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.fabric = Fabric.deserialize(payload);
    });

    async function updateGrid(grid: Grid) {
      if (!pattern.value) return;
      await PatternApi.updateGrid(pattern.value!.id, grid);
    }
    appWindow.listen<string>(PatternEvent.UpdateGrid, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.grid = Grid.deserialize(payload);
    });

    async function addPaletteItem(palitem: PaletteItem) {
      if (!pattern.value) return;
      await PatternApi.addPaletteItem(pattern.value.id, palitem);
    }
    appWindow.listen<string>(PatternEvent.AddPaletteItem, ({ payload }) => {
      if (!pattern.value) return;
      const { palitem, palindex } = AddedPaletteItemData.deserialize(payload);
      pattern.value.palette.insert(palindex, palitem);
      triggerRef(pattern);
    });

    async function removePaletteItem(...paletteItemIndexes: number[]) {
      if (!pattern.value) return;
      await PatternApi.removePaletteItems(pattern.value.id, paletteItemIndexes);
    }
    appWindow.listen<number[]>(PatternEvent.RemovePaletteItem, ({ payload: palindexes }) => {
      if (!pattern.value) return;
      for (const palindex of palindexes.reverse()) {
        pattern.value.palette.remove(palindex);
        // if (appStateStore.selectedPaletteItemIndex === palindex) appStateStore.selectedPaletteItemIndex = undefined;
      }
      triggerRef(pattern);
    });

    async function updatePaletteDisplaySettings(settings: PaletteSettings) {
      if (!pattern.value) return;
      await PatternApi.updatePaletteDisplaySettings(pattern.value.id, settings);
    }
    appWindow.listen<string>(PatternEvent.UpdatePaletteDisplaySettings, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.paletteDisplaySettings = PaletteSettings.deserialize(payload);
      triggerRef(pattern);
    });

    async function sortPaletteBy(sortBy: SortPaletteBy) {
      if (!pattern.value) return;
      await PatternApi.sortPaletteBy(pattern.value.id, sortBy);
    }
    appWindow.listen<number[]>("palette:sort", ({ payload: positions }) => {
      if (!pattern.value) return;
      pattern.value.palette.positions = positions;
      triggerRef(pattern);
    });

    async function reorderPaletteItems(oldPosition: number, newPosition: number) {
      if (!pattern.value) return;
      await PatternApi.reorderPaletteItems(pattern.value.id, oldPosition, newPosition);
    }
    appWindow.listen<number[]>("palette:reorder", ({ payload: positions }) => {
      if (!pattern.value) return;
      pattern.value.palette.positions = positions;
      triggerRef(pattern);
    });

    async function setPaletteItemSymbol(palindex: number, symbol?: Symbol) {
      if (!pattern.value) return;
      await PatternApi.setSymbol(pattern.value.id, palindex, symbol);
    }
    appWindow.listen<string>("palette:set_symbol", ({ payload }) => {
      if (!pattern.value) return;
      const { palindex, symbol } = SetSymbolData.deserialize(payload);
      const item = pattern.value.palette.get(palindex);
      if (item) {
        item.symbol = symbol;
        triggerRef(pattern);
      }
    });

    function addStitch(stitch: Stitch) {
      if (!pattern.value) return;
      return PatternApi.addStitch(pattern.value.id, stitch);
    }
    function removeStitch(stitch: Stitch) {
      if (!pattern.value) return;
      return PatternApi.removeStitch(pattern.value.id, stitch);
    }
    appWindow.listen<string>(PatternEvent.AddStitch, ({ payload }) => {
      if (!pattern.value) return;
      for (const stitch of deserializeStitches(payload)) pattern.value.addStitch(stitch);
    });
    appWindow.listen<string>(PatternEvent.RemoveStitch, ({ payload }) => {
      if (!pattern.value) return;
      for (const stitch of deserializeStitches(payload)) pattern.value.removeStitch(stitch);
    });

    function setDisplayMode(mode: DisplayMode | undefined) {
      if (!pattern.value) return;
      if (mode) return PatternApi.setDisplayMode(pattern.value.id, mode);
      else {
        pattern.value.displayMode = mode;
        return triggerRef(pattern);
      }
    }
    appWindow.listen<DisplayMode>(PatternEvent.UpdateDisplayMode, ({ payload: mode }) => {
      if (!pattern.value) return;
      pattern.value.displayMode = mode;
      triggerRef(pattern);
    });

    function showSymbols(value: boolean) {
      if (!pattern.value) return;
      return PatternApi.showSymbols(pattern.value.id, value);
    }
    appWindow.listen<boolean>(PatternEvent.UpdateShowSymbols, ({ payload: value }) => {
      if (!pattern.value) return;
      pattern.value.showSymbols = value;
      triggerRef(pattern);
    });

    function setLayersVisibility(layersVisibility: LayersVisibility) {
      if (!pattern.value) return;
      return PatternApi.setLayersVisibility(pattern.value.id, layersVisibility);
    }
    appWindow.listen<string>(PatternEvent.UpdateLayersVisibility, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.layersVisibility = LayersVisibility.deserialize(payload);
      triggerRef(pattern);
    });

    async function updatePdfExportOptions(options: PdfExportOptions) {
      if (!pattern.value) return;
      await PatternApi.updatePdfExportOptions(pattern.value.id, options);
    }
    appWindow.listen<string>(PatternEvent.UpdatePdfExportOptions, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.pdfExportOptions = PdfExportOptions.deserialize(payload);
    });

    async function undo(options?: PatternApi.UndoRedoOptions) {
      if (!pattern.value) return;
      await PatternApi.undo(pattern.value.id, options);
    }

    async function redo(options?: PatternApi.UndoRedoOptions) {
      if (!pattern.value) return;
      await PatternApi.redo(pattern.value.id, options);
    }

    async function startTransaction() {
      if (!pattern.value) return;
      await PatternApi.startTransaction(pattern.value.id);
    }

    async function endTransaction() {
      if (!pattern.value) return;
      await PatternApi.endTransaction(pattern.value.id);
    }

    return {
      pattern,
      setReferenceImage,
      removeReferenceImage,
      updateReferenceImageSettings,
      updatePatternInfo,
      updateFabric,
      updateGrid,
      addPaletteItem,
      removePaletteItem,
      updatePaletteDisplaySettings,
      sortPaletteBy,
      reorderPaletteItems,
      setPaletteItemSymbol,
      addStitch,
      removeStitch,
      setDisplayMode,
      showSymbols,
      setLayersVisibility,
      updatePdfExportOptions,
      undo,
      redo,
      startTransaction,
      endTransaction,
    };
  },
  { tauri: { save: false, sync: false } },
);
