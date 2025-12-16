import type { Plugin } from "vue";

import { SHORTCUTS_INJECTION_KEY } from "./constants.ts";
import { createKeydownHandler, ShortcutsContext } from "./lib/";
import type { ShortcutsPluginOptions } from "./types.ts";

export { extractShortcuts } from "./utils/";
export { useShortcuts } from "./composables/";
export type { ShortcutConfig, ShortcutHandler, ShortcutsPluginOptions, ShortcutValue } from "./types.ts";

/** Vue plugin for managing keyboard shortcuts. */
const shortcutsPlugin: Plugin<[ShortcutsPluginOptions?]> = {
  install(app, options = {}) {
    const ctx = new ShortcutsContext(options);
    app.provide(SHORTCUTS_INJECTION_KEY, ctx);

    globalThis.addEventListener("keydown", createKeydownHandler(ctx));
  },
};
export default shortcutsPlugin;
