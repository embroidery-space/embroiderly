import { invoke } from "./index.ts";

export function undo(patternId: string) {
  return invoke<void>("undo", undefined, { headers: { patternId } });
}

export function redo(patternId: string) {
  return invoke<void>("redo", undefined, { headers: { patternId } });
}

export function undoTransaction(patternId: string) {
  return invoke<void>("undo_transaction", undefined, { headers: { patternId } });
}

export function redoTransaction(patternId: string) {
  return invoke<void>("redo_transaction", undefined, { headers: { patternId } });
}

export function startTransaction(patternId: string) {
  return invoke<void>("start_transaction", undefined, { headers: { patternId } });
}

export function endTransaction(patternId: string) {
  return invoke<void>("end_transaction", undefined, { headers: { patternId } });
}
