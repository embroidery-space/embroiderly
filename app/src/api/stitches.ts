import { invoke } from "./index.ts";
import { serializeStitch, type Stitch } from "#/core/pattern/";

export function addStitch(patternId: string, stitch: Stitch) {
  return invoke<void>("add_stitch", serializeStitch(stitch), { headers: { patternId } });
}

export function removeStitch(patternId: string, stitch: Stitch) {
  return invoke<void>("remove_stitch", serializeStitch(stitch), { headers: { patternId } });
}
