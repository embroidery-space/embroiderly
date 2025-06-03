import { invoke } from "./index.ts";
import { PatternProject, Fabric, PatternInfo } from "#/schemas";

export async function loadPattern(patternId: string) {
  const buffer = await invoke<ArrayBuffer>("load_pattern", { patternId });
  return PatternProject.deserialize(new Uint8Array(buffer));
}

export interface OpenPatternOptions {
  /**
   * Whether to restore the pattern from a backup file if it exists.
   *
   * If set to `true`, the command will attempt to restore the pattern from a backup file.
   * If set to `false`, it will not attempt to restore from a backup.
   * If not provided and a backup file exists, it will return an error that the backup file exists and the user must choose how to proceed.
   */
  restoreFromBackup?: boolean;
}
export async function openPattern(filePath: string, options?: OpenPatternOptions) {
  const buffer = await invoke<ArrayBuffer>("open_pattern", { filePath, ...options });
  return PatternProject.deserialize(new Uint8Array(buffer));
}

export async function createPattern(fabric: Fabric) {
  const buffer = await invoke<ArrayBuffer>("create_pattern", Fabric.serialize(fabric));
  return PatternProject.deserialize(new Uint8Array(buffer));
}

export function savePattern(patternId: string, filePath: string) {
  return invoke<void>("save_pattern", { patternId, filePath });
}

export function closePattern(patternId: string) {
  return invoke<void>("close_pattern", { patternId });
}

export function getPatternFilePath(patternId: string) {
  return invoke<string>("get_pattern_file_path", { patternId });
}

export function updatePatternInfo(patternId: string, info: PatternInfo) {
  return invoke<void>("update_pattern_info", PatternInfo.serialize(info), { headers: { patternId } });
}
