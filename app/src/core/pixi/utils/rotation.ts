type CursorStyle = "ns-resize" | "ew-resize" | "nwse-resize" | "nesw-resize";

const TWO_PI = Math.PI * 2;

const HALF_PI = Math.PI / 2;
const QUARTER_PI = Math.PI / 4;
const EIGHTH_PI = Math.PI / 8;

const QUARTER_THREE_PI = (Math.PI * 3) / 4;
const QUARTER_FIVE_PI = (Math.PI * 5) / 4;
const QUARTER_SEVEN_PI = (Math.PI * 7) / 4;

/** Base angles for each cursor style (in radians, where 0 is pointing up/top) */
const CURSOR_ANGLES = {
  /** 0°   (top) */ "ns-resize": 0,
  /** 90°  (right) */ "ew-resize": HALF_PI,
  /** 45°  (top-right) */ "nesw-resize": QUARTER_PI,
  /** 315° (top-left) */ "nwse-resize": 7 * QUARTER_PI,
} as const;

const CURSOR_CACHE = new Map<string, CursorStyle>();
const MAX_CURSOR_CACHE_SIZE = 4 * 360;

/**
 * Returns the cursor style for a given base cursor and rotation.
 * @param baseCursor The base cursor style (`ns-resize`, `ew-resize`, `nesw-resize`, `nwse-resize`).
 * @param rotation The rotation of the element in radians.
 * @returns The cursor style adjusted for the rotation.
 */
export function getCursorForRotation(baseCursor: CursorStyle, rotation: number): CursorStyle {
  // Round rotation to nearest degree for caching (360 possible values).
  const cacheKey = `${baseCursor}_${Math.round((rotation * 180) / Math.PI)}`;

  let cursor = CURSOR_CACHE.get(cacheKey);
  if (cursor) return cursor;

  // Calculate the effective angle.
  const baseAngle = CURSOR_ANGLES[baseCursor];
  let effectiveAngle = (baseAngle + rotation) % TWO_PI;
  if (effectiveAngle < 0) effectiveAngle += TWO_PI;

  // Shift by π/8 to align the segments properly and determine segment.
  const shifted = (effectiveAngle + EIGHTH_PI) % TWO_PI;
  const segment = Math.floor(shifted / QUARTER_PI) % 8;

  // Map segment to cursor style.
  switch (segment) {
    case 0: // Near 0° (top)
    case 4: // Near 180° (bottom)
      cursor = "ns-resize";
      break;
    case 1: // Near 45° (top-right)
    case 5: // Near 225° (bottom-left)
      cursor = "nesw-resize";
      break;
    case 2: // Near 90° (right)
    case 6: // Near 270° (left)
      cursor = "ew-resize";
      break;
    case 3: // Near 135° (bottom-right)
    case 7: // Near 315° (top-left)
      cursor = "nwse-resize";
      break;
    default:
      throw new Error(`Invalid segment: ${segment}`);
  }

  // Limit cache size to prevent infinite growth.
  if (CURSOR_CACHE.size > MAX_CURSOR_CACHE_SIZE) CURSOR_CACHE.clear();
  CURSOR_CACHE.set(cacheKey, cursor);

  return cursor;
}

/**
 * Determine if the rotation is closer to horizontal (0, π) or vertical (π/2, 3π/2) orientation.
 * @param rotation The current rotation angle in radians.
 * @returns True if the rotation is closer to horizontal, false if closer to vertical.
 */
export function checkIfHorizontallyOriented(rotation: number) {
  // Normalize the current rotation to determine primary orientation.
  const normalizedRotation = ((rotation % TWO_PI) + TWO_PI) % TWO_PI;

  // Determine if we're closer to horizontal (0, π) or vertical (π/2, 3π/2) orientation.
  const isHorizontallyOriented =
    normalizedRotation < QUARTER_PI ||
    (normalizedRotation > QUARTER_THREE_PI && normalizedRotation < QUARTER_FIVE_PI) ||
    normalizedRotation > QUARTER_SEVEN_PI;

  return isHorizontallyOriented;
}
