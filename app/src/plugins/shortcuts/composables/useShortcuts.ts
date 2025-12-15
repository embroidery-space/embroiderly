/* eslint-disable no-console */

import { inject, onScopeDispose, toValue, watch } from "vue";
import type { MaybeRefOrGetter } from "vue";

import { SHORTCUTS_INJECTION_KEY } from "../constants.ts";
import { parseShortcutKey } from "../lib/";
import type { ShortcutsContext, ShortcutValue } from "../types.ts";

/**
 * Registers keyboard shortcuts for the current component scope.
 * Shortcuts are automatically unregistered when the component is unmounted.
 */
export function useShortcuts(shortcuts: MaybeRefOrGetter<Record<string, ShortcutValue>>): void {
  const ctx = inject(SHORTCUTS_INJECTION_KEY);
  if (!ctx) {
    console.warn("[shortcuts] Plugin not installed. Call app.use(shortcutsPlugin) first.");
    return;
  }

  let currentIds = new Set<string>();
  const stopWatch = watch(
    () => toValue(shortcuts),
    (shortcuts) => {
      unregisterShortcuts(currentIds, ctx);
      currentIds = registerShortcuts(shortcuts, ctx);
    },
    { immediate: true, deep: true },
  );

  onScopeDispose(() => {
    stopWatch();
    unregisterShortcuts(currentIds, ctx);
  });
}

function registerShortcuts(shortcuts: Record<string, ShortcutValue>, ctx: ShortcutsContext): Set<string> {
  const registeredIds = new Set<string>();
  for (const [key, value] of Object.entries(shortcuts)) {
    const parsed = parseShortcutKey(key);
    if (!parsed) continue;

    const registry = parsed.type === "combination" ? ctx.combinationsRegistry : ctx.sequencesRegistry;
    registry.set(parsed.id, typeof value === "function" ? { handler: value } : value);

    registeredIds.add(`${parsed.type}:${parsed.id}`);
  }
  return registeredIds;
}

function unregisterShortcuts(registeredIds: Set<string>, ctx: ShortcutsContext): void {
  for (const fullId of registeredIds) {
    const [type, id] = fullId.split(":", 2) as ["combination" | "sequence", string];
    const registry = type === "combination" ? ctx.combinationsRegistry : ctx.sequencesRegistry;
    registry.delete(id);
  }
}
