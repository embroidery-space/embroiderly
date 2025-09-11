import { invoke } from "./index.ts";
import { LayersVisibility, type DisplayMode } from "~/core/pattern/";

export function setDisplayMode(patternId: string, mode: DisplayMode) {
  return invoke<void>("set_display_mode", { mode }, { headers: { patternId } });
}

export function showSymbols(patternId: string, value: boolean) {
  return invoke<void>("show_symbols", { value }, { headers: { patternId } });
}

export function setLayersVisibility(patternId: string, visibility: LayersVisibility) {
  return invoke<void>("set_layers_visibility", LayersVisibility.serialize(visibility), { headers: { patternId } });
}
