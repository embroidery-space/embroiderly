import * as Comlink from "comlink";

import init, { PdfExporter } from "../src-wasm/pkg/";

await init();

export class PdfExporterWrapper {
  #exporter: PdfExporter;

  constructor(patternData: Uint8Array, fontData: Uint8Array[]) {
    this.#exporter = new PdfExporter(patternData, fontData);
  }

  export(patternPdf: Uint8Array) {
    if (!this.#exporter) throw new Error("PDF Export worker has not been started");
    return this.#exporter.export(patternPdf);
  }
}

Comlink.expose(PdfExporterWrapper);
