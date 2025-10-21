import { invoke } from "./index.ts";

export interface SymbolFontsList {
  system: string[];
  custom: string[];
}

export function getSymbolFontsList() {
  return invoke<SymbolFontsList>("get_symbol_fonts_list");
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
