import { invoke } from "@tauri-apps/api/core";
import { serializeStitch, type PatternKey, type Stitch } from "#/schemas/index.ts";

export function addStitch(patternKey: PatternKey, stitch: Stitch) {
  return invoke<void>("add_stitch", serializeStitch(stitch), { headers: { patternKey } });
}

export function removeStitch(patternKey: PatternKey, stitch: Stitch) {
  return invoke<void>("remove_stitch", serializeStitch(stitch), { headers: { patternKey } });
}

export function removeStitchAt(patternKey: PatternKey, x: number, y: number) {
  return invoke<void>("remove_stitch_at", { x, y }, { headers: { patternKey } });
}
