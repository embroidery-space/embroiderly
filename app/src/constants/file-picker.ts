import type { DialogFilter } from "@tauri-apps/plugin-dialog";

/**
 * A filter that accepts any file.
 * It is typically used as a last option in all file picker dialogs.
 */

/** A filter that accepts any supported pattern file. */
export const ANY_PATTERN_FILTER: DialogFilter[] = [
  { name: "Cross-Stitch Patterns", extensions: ["embproj", "oxs", "xsd"] },
];
/** A filter that accepts only Embroiderly Project files. */
export const EMBPROJ_FILTER: DialogFilter[] = [{ name: "Embroidery Project", extensions: ["embproj"] }];
/** A filter that accepts only OXS files. */
export const OXS_FILTER: DialogFilter[] = [{ name: "OXS", extensions: ["oxs"] }];

/** A filter that accepts any supported image file. */
export const ANY_IMAGE_FILTER: DialogFilter[] = [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }];

/** A filter that accepts PDF files. */
export const PDF_FILTER: DialogFilter[] = [{ name: "PDF", extensions: ["pdf"] }];

/** A filter that accepts any supported palette files. */
export const PALETTE_FILTER = [
  { name: "All Palette Files", extensions: ["master", "user", "threads", "rng", "json"] },
  { name: "Pattern Maker Palettes", extensions: ["master", "user"] },
  { name: "Win/MacStitch Palettes", extensions: ["threads"] },
  { name: "XSPro Platinum Palettes", extensions: ["rng"] },
  { name: "JSON Palettes", extensions: ["json"] },
];

/** A filter that accept any supported font files. */
export const FONT_FILTER = [
  { name: "All Font Files", extensions: ["ttf", "otf"] },
  { name: "TrueType Fonts", extensions: ["ttf"] },
  { name: "OpenType Fonts", extensions: ["otf"] },
];
