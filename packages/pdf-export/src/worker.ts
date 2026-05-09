import * as Comlink from "comlink";

import init, { export_pdf, PdfVariant } from "../src-wasm/pkg/";

import type { ExportInput } from "./types.ts";

const api = {
  async export(input: ExportInput): Promise<void> {
    await init();

    const { handle, pattern, options, fonts } = input;
    const variant = input.variant === "color" ? PdfVariant.Color : PdfVariant.Monochrome;

    await export_pdf(handle, pattern, options, variant, fonts);
  },
};
Comlink.expose(api);
