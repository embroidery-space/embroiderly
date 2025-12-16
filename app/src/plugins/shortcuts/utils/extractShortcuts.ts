/* eslint-disable @typescript-eslint/no-explicit-any */

import { computed, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";

import type { ShortcutValue } from "../types.ts";

/**
 * Extracts shortcuts from Nuxt UI menu items.
 *
 * @param items - An array of menu item groups (e.g., from `DropdownMenu` or `ContextMenu`).
 * @param separator - A separator to use when joining keys. Use `_` for _key combinations_, and `-` for _key sequences_.
 * @returns A computed value containing record of shortcut keys to handlers.
 */
export function extractShortcuts(items: MaybeRefOrGetter<any[] | any[][]>, separator: "_" | "-" = "_") {
  return computed(() => {
    const shortcuts: Record<string, ShortcutValue> = {};

    function traverse(items: any[]) {
      for (const item of items) {
        if (item.kbds?.length && (item.onSelect || item.onClick)) {
          const shortcutKey = item.kbds.join(separator).toLowerCase();
          shortcuts[shortcutKey] = item.onSelect || item.onClick;
        }
        if (item.children) traverse(item.children.flat());
        if (item.items) traverse(item.items.flat());
      }
    }
    traverse(toValue(items).flat());

    return shortcuts;
  });
}
