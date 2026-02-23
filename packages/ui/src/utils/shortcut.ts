const MODIFIER_ORDER = ["ctrl", "alt", "shift", "meta"];

/** Parses a shortcut string into display segments for Kbd components. */
export function parseShortcutDisplay(shortcut?: string): string[] {
  if (!shortcut?.trim()) return [];

  if (shortcut.includes("+")) {
    const parts = shortcut.split("+");

    const modifiers = parts.filter((p) => MODIFIER_ORDER.includes(p.toLowerCase()));
    const keys = parts.filter((p) => !MODIFIER_ORDER.includes(p.toLowerCase()));

    modifiers.sort((a, b) => MODIFIER_ORDER.indexOf(a.toLowerCase()) - MODIFIER_ORDER.indexOf(b.toLowerCase()));

    return [[...modifiers, ...keys].join("+")];
  }

  if (shortcut.includes("-")) {
    return shortcut.split("-");
  }

  return [shortcut];
}
