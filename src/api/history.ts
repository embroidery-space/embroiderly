import { invoke } from "./index.ts";

export interface UndoRedoOptions {
  /** Whether to undo/redo a single action or the entire transaction. */
  single?: boolean;
}

export function undo(patternId: string, options?: UndoRedoOptions) {
  return invoke<void>("undo", { ...options }, { headers: { patternId } });
}

export function redo(patternId: string, options?: UndoRedoOptions) {
  return invoke<void>("redo", { ...options }, { headers: { patternId } });
}

export function startTransaction(patternId: string) {
  return invoke<void>("start_transaction", undefined, { headers: { patternId } });
}

export function endTransaction(patternId: string) {
  return invoke<void>("end_transaction", undefined, { headers: { patternId } });
}
