import * as Comlink from "comlink";

import type { PdfExporterWrapper } from "./worker.ts";

export class PdfExportService {
  #exporter: Comlink.Remote<PdfExporterWrapper> | null;
  #worker: Worker | null;

  constructor() {
    this.#worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  }

  async init(canvas: OffscreenCanvas, patternData: Uint8Array, fontData: Uint8Array[]) {
    if (!this.#worker) throw new Error("PDF Export service has been destroyed");

    // Wait for the ready signal before wrapping/instantiating.
    // Otherwise, the code freezes, as it never connects to the exposed class,
    // becasue the Wasm module being instanitated asynchronously inside the worker.
    await new Promise((resolve) => {
      this.#worker!.addEventListener("message", (e) => e.data === "READY" && resolve(undefined), { once: true });
    });

    const PdfExporter = Comlink.wrap<typeof PdfExporterWrapper>(this.#worker);
    this.#exporter = await new PdfExporter(
      Comlink.transfer(canvas, [canvas]),
      Comlink.transfer(patternData, [patternData.buffer]),
      Comlink.transfer(
        fontData,
        fontData.map((fd) => fd.buffer),
      ),
    );
  }

  async buildDocument(patternPdf: Uint8Array) {
    if (!this.#exporter) throw new Error("PDF Export service has been destroyed");
    return await this.#exporter.buildDocument(patternPdf);
  }

  async export(patternPdf: Uint8Array) {
    if (!this.#exporter) throw new Error("PDF Export service has been destroyed");
    return await this.#exporter.export(patternPdf);
  }

  async preview(page: number) {
    if (!this.#exporter) throw new Error("PDF Export service has been destroyed");
    return await this.#exporter.preview(page);
  }

  destroy() {
    this.#exporter?.[Comlink.releaseProxy]();
    this.#exporter = null;

    this.#worker?.terminate();
    this.#worker = null;
  }
}
