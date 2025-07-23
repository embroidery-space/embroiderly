import { invoke } from "./index.ts";
import { Pattern, Fabric, PatternInfo } from "#/schemas";

export async function loadPattern(patternId: string) {
  const buffer = await invoke<ArrayBuffer>("load_pattern", { patternId });
  return Pattern.deserialize(new Uint8Array(buffer));
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
  return Pattern.deserialize(new Uint8Array(buffer));
}

export async function createPattern(fabric: Fabric) {
  const buffer = await invoke<ArrayBuffer>("create_pattern", Fabric.serialize(fabric));
  return Pattern.deserialize(new Uint8Array(buffer));
}

export function savePattern(patternId: string, filePath: string) {
  return invoke<void>("save_pattern", { patternId, filePath });
}

export function saveAllPatterns() {
  return invoke<void>("save_all_patterns");
}

export function exportPattern(patternId: string, filePath: string, options: object) {
  return invoke<void>("export_pattern", { patternId, filePath, options });
}

export interface ClosePatternOptions {
  /**
   * Whether to bypass unsaved changes check and force close the pattern.
   * @default false
   */
  force?: boolean;
}
export function closePattern(patternId: string, options?: ClosePatternOptions) {
  return invoke<void>("close_pattern", { patternId, ...options });
}

export function closeAllPatterns() {
  return invoke<void>("close_all_patterns");
}

/**
 * Returns a list of opened patterns with their IDs and titles.
 * This is used on the first app startup to initially load those patterns which were opened using file associations.
 */
export function getOpenedPatterns() {
  return invoke<[id: string, title: string][]>("get_opened_patterns");
}

export function getUnsavedPatterns() {
  return invoke<string[]>("get_unsaved_patterns");
}

export function getPatternFilePath(patternId: string) {
  return invoke<string>("get_pattern_file_path", { patternId });
}

export function updatePatternInfo(patternId: string, info: PatternInfo) {
  return invoke<void>("update_pattern_info", PatternInfo.serialize(info), { headers: { patternId } });
}
