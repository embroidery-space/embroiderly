import {
  deserializeBrandPalette,
  PaletteItem,
  PaletteSettings,
  SetSymbolData,
  SortPaletteBy,
  Symbol,
} from "~/core/pattern/";

import { invoke } from "./index.ts";

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

export function importPalettes(paths: string[]) {
  return invoke<{ failedFiles: string[] }>("import_palettes", { paths });
}

export function getPalettesList() {
  return invoke<{ system: string[]; custom: string[] }>("get_palettes_list");
}

export async function loadPalette(paletteGroup: string, paletteName: string) {
  const buffer = await invoke<ArrayBuffer>("load_palette", { paletteGroup, paletteName });
  return deserializeBrandPalette(new Uint8Array(buffer));
}

export async function resolvePalettePath(paletteGroup: string, paletteName: string) {
  return await invoke<string>("resolve_palette_path", { paletteGroup, paletteName });
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
