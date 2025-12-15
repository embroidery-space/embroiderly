import type { Plugin } from "vue";

import { SHORTCUTS_INJECTION_KEY } from "./constants.ts";
import { createKeydownHandler } from "./lib/";
import type { ShortcutsContext, ShortcutsPluginOptions } from "./types.ts";

export { extractShortcuts } from "./utils/";
export { useShortcuts } from "./composables/";
export type { ShortcutConfig, ShortcutHandler, ShortcutsPluginOptions, ShortcutValue } from "./types.ts";

const DEFAULT_OPTIONS: Required<ShortcutsPluginOptions> = {
  chainDelay: 500,
  excludeTags: ["INPUT", "TEXTAREA", "SELECT"],
};

/** Vue plugin for managing keyboard shortcuts. */
const shortcutsPlugin: Plugin<[ShortcutsPluginOptions?]> = {
  install(app, options = {}) {
    const ctx: ShortcutsContext = {
      options: { ...DEFAULT_OPTIONS, ...options },
      combinationsRegistry: new Map(),
      sequencesRegistry: new Map(),
    };
    app.provide(SHORTCUTS_INJECTION_KEY, ctx);

    globalThis.addEventListener("keydown", createKeydownHandler(ctx));
  },
};
export default shortcutsPlugin;
