import { invoke } from "@tauri-apps/api/core";
import type { PatternKey } from "#/schemas/pattern";

export function undo(patternKey: PatternKey) {
  return invoke<void>("undo", { patternKey });
}

export function redo(patternKey: PatternKey) {
  return invoke<void>("redo", { patternKey });
}
