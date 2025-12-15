import type { InjectionKey } from "vue";

import type { ShortcutsContext } from "./types.ts";

export const SHORTCUTS_INJECTION_KEY: InjectionKey<ShortcutsContext> = Symbol("shortcuts");
