import * as Comlink from "comlink";

import init, { export_pdf, PdfVariant } from "../src-wasm/pkg/";

import type { ExportInput } from "./types.ts";

const api = {
  async export(input: ExportInput): Promise<Uint8Array> {
    await init();

    const variant = input.variant === "color" ? PdfVariant.Color : PdfVariant.Monochrome;
    return export_pdf(input.pattern, input.options, variant, input.fonts);
  },
};
Comlink.expose(api);
