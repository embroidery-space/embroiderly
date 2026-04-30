export type PdfVariant = "monochrome" | "color";

export interface ExportInput {
  /** Borsh-serialised `PatternProject`. */
  pattern: Uint8Array;
  /** Borsh-serialised `PdfExportOptions`. */
  options: Uint8Array;
  /** Whether the document is black-and-white (monochrome) or color. */
  variant: PdfVariant;
  /** Raw bytes of every symbol font referenced by the pattern palette. Text fonts are bundled in the Wasm module. */
  fonts: Uint8Array[];
}
