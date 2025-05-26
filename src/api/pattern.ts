import { invoke } from "@tauri-apps/api/core";
import { PatternProject, Fabric } from "#/schemas/index.ts";

export async function loadPattern(patternId: string) {
  const buffer = await invoke<ArrayBuffer>("load_pattern", { patternId });
  return PatternProject.deserialize(new Uint8Array(buffer));
}

export async function openPattern(filePath: string) {
  const buffer = await invoke<ArrayBuffer>("open_pattern", { filePath });
  return PatternProject.deserialize(new Uint8Array(buffer));
}

export async function createPattern(fabric: Fabric) {
  const buffer = await invoke<ArrayBuffer>("create_pattern", Fabric.serialize(fabric));
  return PatternProject.deserialize(new Uint8Array(buffer));
}

export function savePattern(id: string, filePath: string) {
  return invoke<void>("save_pattern", { id, filePath });
}

export function closePattern(id: string) {
  return invoke<void>("close_pattern", { id });
}

export function getPatternFilePath(id: string) {
  return invoke<string>("get_pattern_file_path", { id });
}
