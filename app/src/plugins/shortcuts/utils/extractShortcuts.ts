/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ShortcutValue } from "../types.ts";

/**
 * Extracts shortcuts from Nuxt UI menu items.
 *
 * @param items - Array of menu item groups (e.g., from `DropdownMenu` or `ContextMenu`).
 * @param separator - Separator to use when joining keys. Use `_` for _key combinations_, and `-` for _key sequences_.
 * @returns Record of shortcut keys to handlers.
 */
export function extractShortcuts(items: any[] | any[][], separator: "_" | "-" = "_") {
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
  traverse(items.flat());

  return shortcuts;
}
