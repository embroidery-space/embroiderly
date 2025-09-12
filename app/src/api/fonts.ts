import { invoke } from "./index.ts";

export function loadStitchFont(fontFamily: string) {
  return invoke<ArrayBuffer>("load_stitch_font", { fontFamily });
}
