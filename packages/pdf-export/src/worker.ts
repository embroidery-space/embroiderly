import * as Comlink from "comlink";

import init, { export_pdf, PdfVariant } from "../src-wasm/pkg/";

import type { ExportInput } from "./types.ts";

const api = {
  async export(input: ExportInput): Promise<Uint8Array> {
    await init();

    const { pattern, options, fonts } = input;
    const variant = input.variant === "color" ? PdfVariant.Color : PdfVariant.Monochrome;

    const pdfBytes = export_pdf(pattern, options, variant, fonts);
    return Comlink.transfer(pdfBytes, [pdfBytes.buffer]);
  },
};
Comlink.expose(api);
