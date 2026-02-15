import { KEY_MAPPING, MODIFIER_MAPPING, MODIFIER_ORDER, MODIFIER_SET } from "./key-mapping";

export interface ParsedShortcut {
  type: "combination" | "sequence";
  id: string;
}

/**
 * Parses the user-provided shortcut key to an internal representation.
 * @param key - The shortcut key to parse.
 * @returns A parsed shortcut object or null if the key is invalid.
 */
export function parseShortcutKey(key: string): ParsedShortcut | null {
  return key.includes("_") ? parseCombination(key) : parseSequence(key);
}

/** Parses _key combinations_ (e.g., `ctrl_z`, `alt_shift_delete`) */
function parseCombination(key: string): ParsedShortcut | null {
  const parts = key.split("_");
  const modifiers: string[] = [];
  let mainKey: string | null = null;

  for (const part of parts) {
    const trimmed = part.trim();
    const modifier = normalizeModifier(trimmed);
    if (modifier && MODIFIER_SET.has(modifier as (typeof MODIFIER_ORDER)[number])) {
      modifiers.push(modifier);
    } else {
      const code = normalizeKey(trimmed);
      if (!code) {
        console.warn(`[shortcuts] Unknown key "${trimmed}" in combination "${key}". Skipping.`);
        return null;
      }
      mainKey = code;
    }
  }

  if (!mainKey) {
    console.warn(`[shortcuts] No main key found in combination "${key}". Skipping.`);
    return null;
  }

  // Sort modifiers alphabetically for consistent ID
  modifiers.sort((a, b) => MODIFIER_ORDER.indexOf(a) - MODIFIER_ORDER.indexOf(b));

  return { type: "combination", id: [...modifiers, mainKey].join("_") };
}

/** Parses _key sequences_ (e.g., `f-g`, `p-t-l`) */
function parseSequence(key: string): ParsedShortcut | null {
  const parts = key.split("-");
  const codes: string[] = [];

  for (const part of parts) {
    const code = normalizeKey(part.trim());
    if (!code) {
      console.warn(`[shortcuts] Unknown key "${part}" in sequence "${key}". Skipping.`);
      return null;
    }
    codes.push(code);
  }

  return { type: "sequence", id: codes.join("-") };
}

function normalizeKey(key: string): string | null {
  const lower = key.toLowerCase();
  return KEY_MAPPING[lower] ?? null;
}

function normalizeModifier(key: string): string | null {
  const lower = key.toLowerCase();
  return MODIFIER_MAPPING[lower] ?? null;
}
