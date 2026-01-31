import convert from "color-convert";

const HEX_REGEX = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

export interface HSV {
  /** Hue: 0-360 */
  h: number;
  /** Saturation: 0-100 */
  s: number;
  /** Value (brightness): 0-100 */
  v: number;
}

/** Validates if a string is a valid HEX color. */
export function isValidHex(hex: string): boolean {
  return HEX_REGEX.test(hex);
}

/** Normalizes a HEX color string to uppercase 6-digit format without hash. */
function normalizeHex(hex: string): string {
  let normalized = hex.replace(/^#/, "").toUpperCase();

  // Expand 3-digit hex to 6-digit.
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((c) => c + c)
      .join("");
  }

  return normalized;
}

/** Converts a HEX color string to HSV. */
export function hexToHsv(hex: string): HSV {
  const [h, s, v] = convert.hex.hsv(normalizeHex(hex));
  return { h, s, v };
}

/** Converts HSV to a HEX color string (with hash prefix). */
export function hsvToHex(hsv: HSV): string {
  const hex = convert.hsv.hex([hsv.h, hsv.s, hsv.v]);
  return `#${hex}`;
}
