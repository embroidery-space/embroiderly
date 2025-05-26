import { invoke } from "@tauri-apps/api/core";
import { type DisplayMode } from "#/schemas/index.ts";

export function setDisplayMode(patternId: string, mode: DisplayMode) {
  return invoke<void>("set_display_mode", { mode }, { headers: { patternId } });
}

export function showSymbols(patternId: string, value: boolean) {
  return invoke<void>("show_symbols", { value }, { headers: { patternId } });
}
