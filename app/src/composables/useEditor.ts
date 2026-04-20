import { inject } from "vue";
import type { InjectionKey } from "vue";

import type { EditorContext } from "~/wasm/";

export const EditorContextKey = Symbol("embroiderly-editor-context") as InjectionKey<EditorContext>;

export function useEditor() {
  const context = inject(EditorContextKey);
  if (!context) throw new Error("Editor context not provided. Ensure it is provided at the app level (main.ts).");

  return context;
}
