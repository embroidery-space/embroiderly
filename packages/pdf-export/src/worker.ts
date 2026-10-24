import * as Comlink from "comlink";

import init, { PdfExporter } from "../src-wasm/pkg/";

const wasm = await init();

export class PdfExporterWrapper {
  #offscreenCanvasContext: OffscreenCanvasRenderingContext2D;
  #exporter: PdfExporter;

  constructor(canvas: OffscreenCanvas, patternData: Uint8Array, fontData: Uint8Array[]) {
    this.#offscreenCanvasContext = canvas.getContext("2d")!;
    this.#exporter = new PdfExporter(patternData, fontData);
  }

  buildDocument(patternPdf: Uint8Array) {
    return this.#exporter.buildDocument(patternPdf);
  }

  export(patternPdf: Uint8Array) {
    return this.#exporter.export(patternPdf);
  }

  preview(page: number) {
    const renderedPage = this.#exporter.preview(page);
    const { width, height, ptr: bufferPointer, len: bufferLength } = renderedPage;

    const wasmMemoryView = new Uint8ClampedArray(wasm.memory.buffer, bufferPointer, bufferLength);
    const imageData = new ImageData(wasmMemoryView, width, height);

    this.#offscreenCanvasContext.canvas.width = width;
    this.#offscreenCanvasContext.canvas.height = height;

    this.#offscreenCanvasContext.putImageData(imageData, 0, 0);

    renderedPage.free();
  }
}

Comlink.expose(PdfExporterWrapper);
postMessage("READY");
