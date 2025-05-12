import { invoke } from "@tauri-apps/api/core";

export function loadStitchFont(fontFamily: string) {
  return invoke<ArrayBuffer>("load_stitch_font", { fontFamily });
}
