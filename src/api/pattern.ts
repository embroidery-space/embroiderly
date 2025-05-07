import { invoke } from "@tauri-apps/api/core";
import { type PatternKey, PatternProject, Fabric } from "#/schemas/index.ts";

export async function loadPattern(filePath: string) {
  const buffer = await invoke<ArrayBuffer>("load_pattern", undefined, { headers: { filePath } });
  return PatternProject.deserialize(new Uint8Array(buffer));
}

export async function createPattern(fabric: Fabric) {
  const buffer = await invoke<ArrayBuffer>("create_pattern", Fabric.serialize(fabric));
  return PatternProject.deserialize(new Uint8Array(buffer));
}

export function savePattern(patternKey: PatternKey, filePath: string) {
  return invoke<void>("save_pattern", undefined, { headers: { patternKey, filePath } });
}

export function closePattern(patternKey: PatternKey) {
  return invoke<void>("close_pattern", undefined, { headers: { patternKey } });
}

export function getPatternFilePath(patternKey: PatternKey) {
  return invoke<string>("get_pattern_file_path", { patternKey });
}
