import { invoke } from "@tauri-apps/api/core";

export function undo(patternId: string) {
  return invoke<void>("undo", undefined, { headers: { patternId } });
}

export function redo(patternId: string) {
  return invoke<void>("redo", undefined, { headers: { patternId } });
}
