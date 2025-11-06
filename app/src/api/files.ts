import { Pattern, Fabric, deserializeBrandPalette } from "~/core/pattern/";

import { invoke } from "./index.ts";

export interface GroupedFilesList {
  system: string[];
  custom: string[];
}

// === Pattern files management ===

export async function loadPattern(patternId: string) {
  const buffer = await invoke<ArrayBuffer>("load_pattern", { patternId });
  return Pattern.deserialize(new Uint8Array(buffer));
}

export interface OpenPatternOptions {
  /**
   * Whether to restore the pattern from a backup file if it exists.i
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

// === Palette files management ===

export function importPalettes(paths: string[]) {
  return invoke<{ failedFiles: string[] }>("import_palettes", { paths });
}

export function getPalettesList() {
  return invoke<GroupedFilesList>("get_palettes_list");
}

export async function loadPalette(paletteGroup: string, paletteName: string) {
  const buffer = await invoke<ArrayBuffer>("load_palette", { paletteGroup, paletteName });
  return deserializeBrandPalette(new Uint8Array(buffer));
}

export async function resolvePalettePath(paletteGroup: string, paletteName: string) {
  return await invoke<string>("resolve_palette_path", { paletteGroup, paletteName });
}

// === Symbol font files management ===

export function getSymbolFontsList() {
  return invoke<GroupedFilesList>("get_symbol_fonts_list");
}

export function loadSymbolFontCodePoints(fontFamily: string) {
  return invoke<number[]>("load_symbol_font_code_points", { fontFamily });
}

export async function loadSymbolFont(fontFamily: string) {
  const fontData = await invoke<ArrayBuffer>("load_symbol_font_content", { fontFamily });

  const fontFace = new FontFace(fontFamily, fontData);
  await fontFace.load();

  return fontFace;
}

export interface ImportSymbolFontsResponse {
  failedFiles: string[];
}

export function importSymbolFonts(paths: string[]) {
  return invoke<ImportSymbolFontsResponse>("import_symbol_fonts", { paths });
}

// === Importing images into patterns ===

export function getImageDimensions(imagePath: string) {
  return invoke<[width: number, height: number]>("get_image_dimensions", { imagePath });
}

export async function importPatternFromImage(imagePath: string, palettePath: string, options: object) {
  const buffer = await invoke<ArrayBuffer>("import_pattern_from_image", { imagePath, palettePath, options });
  return Pattern.deserialize(new Uint8Array(buffer));
}

// === Exporting pattern into PDF documents ===

export function exportPattern(patternId: string, filePath: string, options: object) {
  return invoke<void>("export_pattern", { patternId, filePath, options });
}
