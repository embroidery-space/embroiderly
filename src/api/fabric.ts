import { invoke } from "@tauri-apps/api/core";
import { type PatternKey, Fabric } from "#/schemas/index.ts";

export function updateFabric(patternKey: PatternKey, fabric: Fabric) {
  return invoke<void>("update_fabric", Fabric.serialize(fabric), { headers: { patternKey } });
}
