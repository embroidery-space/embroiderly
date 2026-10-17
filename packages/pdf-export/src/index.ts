import * as Comlink from "comlink";

interface PdfExportWorkerApi {
  start: (patternData: Uint8Array, fontData: Uint8Array[]) => Promise<void>;
  export: (patternPdf: Uint8Array) => Promise<Uint8Array>;
}

export class PdfExportService {
  #api: Comlink.Remote<PdfExportWorkerApi> | null;
  #worker: Worker | null;

  constructor() {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

    this.#api = Comlink.wrap<PdfExportWorkerApi>(worker);
    this.#worker = worker;
  }

  async start(patternData: Uint8Array, fontData: Uint8Array[]) {
    if (!this.#api) throw new Error("PDF Export service has been destroyed");
    return await this.#api.start(
      Comlink.transfer(patternData, [patternData.buffer]),
      Comlink.transfer(
        fontData,
        fontData.map((fd) => fd.buffer),
      ),
    );
  }

  async export(patternPdf: Uint8Array) {
    if (!this.#api) throw new Error("PDF Export service has been destroyed");
    return await this.#api.export(patternPdf);
  }

  destroy() {
    this.#api?.[Comlink.releaseProxy]();
    this.#api = null;

    this.#worker?.terminate();
    this.#worker = null;
  }
}
