import * as Comlink from "comlink";

import init, { PdfExportWorker } from "../src-wasm/pkg/";

let initialized = false;
let worker: PdfExportWorker | null = null;

const api = {
  async start(patternData: Uint8Array, fontData: Uint8Array[]) {
    if (!initialized) {
      await init();
      initialized = true;
    }

    worker = new PdfExportWorker(patternData, fontData);
  },

  export(patternPdf: Uint8Array) {
    if (!worker) throw new Error("PDF Export worker has not been started");
    return worker.export(patternPdf);
  },
};
Comlink.expose(api);
