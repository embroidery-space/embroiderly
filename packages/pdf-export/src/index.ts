import * as Comlink from "comlink";

import type { PdfExporterWrapper } from "./worker.ts";

export class PdfExportService {
  #exporter: Comlink.Remote<PdfExporterWrapper> | null;
  #worker: Worker | null;

  constructor() {
    this.#worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  }

  async init(canvas: OffscreenCanvas, patternData: Uint8Array, fonts: Uint8Array) {
    if (!this.#worker) throw new Error("PDF Export service has been destroyed");

    // Wait for the ready signal before wrapping/instantiating.
    // Otherwise, the code freezes, as it never connects to the exposed class,
    // becasue the Wasm module being instanitated asynchronously inside the worker.
    await new Promise((resolve) => {
      this.#worker!.addEventListener("message", (e) => e.data === "READY" && resolve(undefined), { once: true });
    });

    const PdfExporter = Comlink.wrap<typeof PdfExporterWrapper>(this.#worker);
    this.#exporter = await new PdfExporter(Comlink.transfer(canvas, [canvas]), patternData, fonts);
  }

  async addFonts(fonts: Uint8Array) {
    if (!this.#exporter) throw new Error("PDF Export service has been destroyed");
    await this.#exporter.addFonts(fonts);
  }

  async removeFont(fileName: string) {
    if (!this.#exporter) throw new Error("PDF Export service has been destroyed");
    await this.#exporter.removeFont(fileName);
  }

  async compileDocument(template: string) {
    if (!this.#exporter) throw new Error("PDF Export service has been destroyed");
    return await this.#exporter.compileDocument(template);
  }

  async export() {
    if (!this.#exporter) throw new Error("PDF Export service has been destroyed");
    return await this.#exporter.export();
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

export * from "./types.ts";
