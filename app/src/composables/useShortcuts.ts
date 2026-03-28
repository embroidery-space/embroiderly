/* eslint-disable @typescript-eslint/no-explicit-any */

import { useHotkeys, useHotkeySequences } from "@tanstack/vue-hotkeys";
import type { UseHotkeyDefinition, UseHotkeySequenceDefinition } from "@tanstack/vue-hotkeys";
import { computed, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";

/**
 * Registers keyboard shortcuts for the current component scope.
 * Shortcuts are automatically unregistered when the component unmounts.
 *
 * Keys containing `+` are treated as combinations (e.g., `Control+S`).
 * All other keys are treated as sequences (e.g., `P-T-L` → `['P', 'T', 'L']`, `F` → `['F']`).
 */
export function useShortcuts(shortcuts: MaybeRefOrGetter<Record<string, () => void>>) {
  useHotkeys(() =>
    Object.entries(toValue(shortcuts))
      .filter(([key]) => key.includes("+"))
      .map(
        ([key, callback]): UseHotkeyDefinition => ({
          hotkey: key as unknown as UseHotkeyDefinition["hotkey"],
          callback,
        }),
      ),
  );

  useHotkeySequences(() =>
    Object.entries(toValue(shortcuts))
      .filter(([key]) => !key.includes("+"))
      .map(
        ([key, callback]): UseHotkeySequenceDefinition => ({
          sequence: key.split("-") as unknown as UseHotkeySequenceDefinition["sequence"],
          callback,
        }),
      ),
  );
}

/**
 * Extracts shortcuts from menu items.
 *
 * @param items - An array of menu item groups (e.g., from `DropdownMenu` or `ContextMenu`).
 * @returns A computed value containing a record of shortcut keys to handlers.
 */
export function extractShortcuts(items: MaybeRefOrGetter<any[] | any[][]>) {
  return computed(() => {
    const shortcuts: Record<string, () => void> = {};

    function traverse(items: any[]) {
      for (const item of items) {
        if (item.shortcut && (item.onSelect || item.onClick)) {
          shortcuts[item.shortcut] = item.onSelect || item.onClick;
        }

        if (item.children) traverse(item.children.flat());
        if (item.items) traverse(item.items.flat());
      }
    }
    traverse(toValue(items).flat());

    return shortcuts;
  });
}
