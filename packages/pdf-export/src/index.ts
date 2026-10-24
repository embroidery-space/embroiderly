import * as Comlink from "comlink";

import type { PdfExporterWrapper } from "./worker.ts";

export class PdfExportService {
  #exporter: Comlink.Remote<PdfExporterWrapper> | null;
  #worker: Worker | null;

  constructor() {
    this.#worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  }

  async init(patternData: Uint8Array, fontData: Uint8Array[]) {
    if (!this.#worker) throw new Error("PDF Export service has been destroyed");

    const PdfExporter = Comlink.wrap<typeof PdfExporterWrapper>(this.#worker);
    this.#exporter = await new PdfExporter(
      Comlink.transfer(patternData, [patternData.buffer]),
      Comlink.transfer(
        fontData,
        fontData.map((fd) => fd.buffer),
      ),
    );
  }

  async export(patternPdf: Uint8Array) {
    if (!this.#exporter) throw new Error("PDF Export service has been destroyed");
    return await this.#exporter.export(patternPdf);
  }

  destroy() {
    this.#exporter?.[Comlink.releaseProxy]();
    this.#exporter = null;

    this.#worker?.terminate();
    this.#worker = null;
  }
}
