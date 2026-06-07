import { formatForDisplay } from "@tanstack/vue-hotkeys";

/** Parses a shortcut string into display segments for `Kbd` components. */
export function parseShortcutDisplay(shortcut: string) {
  return formatForDisplay(shortcut, { useSymbols: false }).split("-");
}
