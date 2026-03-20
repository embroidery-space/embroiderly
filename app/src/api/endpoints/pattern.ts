import {
  deserializeFabricColors,
  DisplaySettings,
  Fabric,
  Grid,
  FabricColor,
  PatternInfo,
  ReferenceImageSettings,
  PaletteItem,
  PaletteSettings,
  SortPaletteBy,
  Symbol,
  SetSymbolData,
  serializeStitch,
  PdfExportOptions,
} from "~/lib/pattern/";
import type { Stitch } from "~/lib/pattern/";

import { invoke } from "../client.ts";

// === Pattern Info === //

export function updatePatternInfo(patternId: string, info: PatternInfo) {
  return invoke<void>("update_pattern_info", PatternInfo.serialize(info), { headers: { patternId } });
}

// === Reference Image === //

export function setReferenceImage(patternId: string, filePath: string) {
  return invoke<void>("set_reference_image", { filePath }, { headers: { patternId } });
}

export function removeReferenceImage(patternId: string) {
  return invoke<void>("remove_reference_image", undefined, { headers: { patternId } });
}

export function updateReferenceImageSettings(patternId: string, settings: ReferenceImageSettings) {
  return invoke<void>("update_reference_image_settings", ReferenceImageSettings.serialize(settings), {
    headers: { patternId },
  });
}

// === Display Settings === //

export function updateDisplaySettings(patternId: string, displaySettings: DisplaySettings) {
  return invoke<void>("update_display_settings", DisplaySettings.serialize(displaySettings), {
    headers: { patternId },
  });
}

// === Fabric Properties === //

export function updateFabric(patternId: string, fabric: Fabric) {
  return invoke<void>("update_fabric", Fabric.serialize(fabric), { headers: { patternId } });
}

export async function loadFabricColors(): Promise<FabricColor[]> {
  const buffer = await invoke<ArrayBuffer>("load_fabric_colors");
  return deserializeFabricColors(new Uint8Array(buffer));
}

// === Grid Properties === //

export function updateGrid(patternId: string, grid: Grid) {
  return invoke<void>("update_grid", Grid.serialize(grid), { headers: { patternId } });
}

// === Palette Management === //

export function addPaletteItem(patternId: string, paletteItem: PaletteItem) {
  return invoke<void>("add_palette_item", PaletteItem.serialize(paletteItem), { headers: { patternId } });
}

export function removePaletteItems(patternId: string, paletteItemIndexes: number[]) {
  return invoke<void>("remove_palette_items", { paletteItemIndexes }, { headers: { patternId } });
}

export function updatePaletteDisplaySettings(patternId: string, displaySettings: PaletteSettings) {
  return invoke<void>("update_palette_display_settings", PaletteSettings.serialize(displaySettings), {
    headers: { patternId },
  });
}

export function sortPaletteBy(patternId: string, sortBy: SortPaletteBy) {
  return invoke<void>("sort_palette_by", { sortBy }, { headers: { patternId } });
}

export function reorderPaletteItems(patternId: string, oldPosition: number, newPosition: number) {
  return invoke<void>("reorder_palette_items", { oldPosition, newPosition }, { headers: { patternId } });
}

export function setSymbol(patternId: string, palindex: number, symbol?: Symbol) {
  return invoke<void>("set_symbol", SetSymbolData.serialize({ palindex, symbol }), { headers: { patternId } });
}

// === Layer Management === //

export function addLayer(patternId: string, name: string) {
  return invoke<void>("add_layer", { name }, { headers: { patternId } });
}

export function removeLayer(patternId: string, layerIndex: number) {
  return invoke<void>("remove_layer", { layerIndex }, { headers: { patternId } });
}

// === Stitches Management === //

export function addStitch(patternId: string, stitch: Stitch) {
  return invoke<void>("add_stitch", serializeStitch(stitch), { headers: { patternId } });
}

export function removeStitch(patternId: string, stitch: Stitch) {
  return invoke<void>("remove_stitch", serializeStitch(stitch), { headers: { patternId } });
}

// === Publish Settings === //

export function updatePdfExportOptions(patternId: string, options: PdfExportOptions) {
  return invoke<void>("update_pdf_export_options", PdfExportOptions.serialize(options), { headers: { patternId } });
}

// === History Management === //

export interface UndoRedoOptions {
  /** Whether to undo/redo a single action or the entire transaction. */
  single?: boolean;
}

export function undo(patternId: string, options?: UndoRedoOptions) {
  return invoke<void>("undo", { ...options }, { headers: { patternId } });
}

export function redo(patternId: string, options?: UndoRedoOptions) {
  return invoke<void>("redo", { ...options }, { headers: { patternId } });
}

export function startTransaction(patternId: string) {
  return invoke<void>("start_transaction", undefined, { headers: { patternId } });
}

export function endTransaction(patternId: string) {
  return invoke<void>("end_transaction", undefined, { headers: { patternId } });
}
