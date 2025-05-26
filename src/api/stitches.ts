import { invoke } from "@tauri-apps/api/core";
import { serializeStitch, type Stitch } from "#/schemas";

export function addStitch(patternId: string, stitch: Stitch) {
  return invoke<void>("add_stitch", serializeStitch(stitch), { headers: { patternId } });
}

export function removeStitch(patternId: string, stitch: Stitch) {
  return invoke<void>("remove_stitch", serializeStitch(stitch), { headers: { patternId } });
}
