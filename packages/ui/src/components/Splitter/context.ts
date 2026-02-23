import type { InjectionKey } from "vue";

import type { SplitterTheme } from "./Splitter.theme.ts";

export interface SplitterContext {
  ui: ReturnType<typeof SplitterTheme>;
}

export const SplitterContextKey: InjectionKey<SplitterContext> = Symbol("SplitterContext");
