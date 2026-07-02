import { formatForDisplay } from "@tanstack/vue-hotkeys";

/** Parses a shortcut string into display segments for `Kbd` components. */
export function parseShortcutDisplay(shortcut: string) {
  return splitShortcutKey(formatForDisplay(shortcut, { useSymbols: false }));
}

/**
 * Splits a shortcut key string into its sequence steps.
 *
 * `-` is treated as a sequence separator only when it is **not** immediately preceded by `+`,
 * so `Ctrl+-` stays intact (the `-` is the key name) while `Shift+V-M` -> `['Shift+V', 'M']`.
 */
export function splitShortcutKey(key: string) {
  return key.split(/(?<!\+)-/u);
}
