import type { InjectionKey } from "vue";

import type { ShortcutsContext } from "./lib/";

export const SHORTCUTS_INJECTION_KEY: InjectionKey<ShortcutsContext> = Symbol("shortcuts");
