import * as Comlink from "comlink";

import { ImageImportOptionsSchema } from "./types.ts";
import type { ImageImportOptions } from "./types.ts";

export type * from "./types.ts";

interface ImageImportWorkerApi {
  start: (imageBytes: Uint8Array) => Promise<{ width: number; height: number }>;
  getPreview: (paletteBytes: Uint8Array, optionsBytes: Uint8Array) => Promise<Uint8Array>;
}

/** Long-lived image import service. */
export class ImageImportService {
  #api: Comlink.Remote<ImageImportWorkerApi> | null;
  #worker: Worker | null;

  constructor() {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

    this.#api = Comlink.wrap<ImageImportWorkerApi>(worker);
    this.#worker = worker;
  }

  async start(imageBytes: Uint8Array) {
    if (!this.#api) throw new Error("Image import service has been destroyed");
    return await this.#api.start(Comlink.transfer(imageBytes, [imageBytes.buffer]));
  }

  async getPreview(paletteBytes: Uint8Array, options: ImageImportOptions) {
    if (!this.#api) throw new Error("Image import service has been destroyed");

    const optionsBytes = ImageImportOptionsSchema.serialize(options);
    return await this.#api.getPreview(paletteBytes, Comlink.transfer(optionsBytes, [optionsBytes.buffer]));
  }

  destroy() {
    this.#api?.[Comlink.releaseProxy]();
    this.#api = null;

    this.#worker?.terminate();
    this.#worker = null;
  }
}
