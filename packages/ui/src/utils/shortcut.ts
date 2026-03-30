/** Modifier keys in their display order. */
const MODIFIERS = ["Ctrl", "Alt", "Shift", "Meta"];

/** Maps modifier key names (lowercase) to their display values. */
const KEYS_MAP: Record<string, string> = {
  ctrl: "Ctrl",
  control: "Ctrl",
  alt: "Alt",
  shift: "Shift",
  meta: "Meta",
};

/** Parses a shortcut string into display segments for Kbd components. */
export function parseShortcutDisplay(shortcut?: string): string[] {
  const value = shortcut?.trim();
  if (!value) return [];

  if (value.includes("+")) {
    // Do not filter empty strings, as it will broke shortcuts with the `+` sign (e.g., `Ctrl++`).
    // For example, `["Ctrl", "", ""]` will be correctly reconstructed to `Ctrl++`.
    const parts = value.split("+");

    const modifiers = parts.filter((p) => isModifier(p)).map((p) => KEYS_MAP[p.toLowerCase()] ?? p);
    const keys = parts.filter((p) => !isModifier(p));

    // Modifier keys are already filtered and mapped, so we can sort them directly.
    modifiers.sort((a, b) => MODIFIERS.indexOf(a) - MODIFIERS.indexOf(b));

    return [[...modifiers, ...keys].join("+")];
  }

  if (value.includes("-")) {
    return value.split("-");
  }

  return [value];
}

function isModifier(key: string) {
  return MODIFIERS.includes(KEYS_MAP[key.toLowerCase()] ?? key);
}
