import type { FilePickerAcceptType } from "show-open-file-picker/types";

/** A filter that accepts any supported pattern file. */
export const ANY_PATTERN_FILTER: FilePickerAcceptType[] = [
  {
    description: "Cross-Stitch Patterns",
    accept: { "application/octet-stream": [".embproj", ".oxs", ".xsd"] },
  },
];

/** A filter that accepts only Embroiderly Project files. */
export const EMBPROJ_FILTER: FilePickerAcceptType[] = [
  {
    description: "Embroidery Project",
    accept: { "application/octet-stream": [".embproj"] },
  },
];

/** A filter that accepts only OXS files. */
export const OXS_FILTER: FilePickerAcceptType[] = [
  {
    description: "OXS",
    accept: { "application/octet-stream": [".oxs"] },
  },
];

/** A filter that accepts any supported image file. */
export const ANY_IMAGE_FILTER: FilePickerAcceptType[] = [
  {
    description: "Images",
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
  },
];

/** A filter that accepts PDF files. */
export const PDF_FILTER: FilePickerAcceptType[] = [
  {
    description: "PDF",
    accept: { "application/pdf": [".pdf"] },
  },
];

/** A filter that accepts any supported palette file. */
export const PALETTE_FILTER: FilePickerAcceptType[] = [
  {
    description: "Palette files",
    accept: {
      "application/octet-stream": [".master", ".user", ".rng"],
      "text/plain": [".threads"],
      "application/json": [".json"],
    },
  },
];

/** A filter that accepts any supported font file. */
export const FONT_FILTER: FilePickerAcceptType[] = [
  {
    description: "Font files",
    accept: { "font/*": [".ttf", ".otf"] },
  },
];
