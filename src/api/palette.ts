import { invoke } from "@tauri-apps/api/core";
import { PaletteItem, PaletteSettings } from "#/schemas/index.ts";

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
