import { invoke } from "./index.ts";
import { deserializeBrandPalette, PaletteItem, PaletteSettings } from "~/core/pattern/";

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
