import * as Comlink from "comlink";

import init, { PdfExporter } from "../src-wasm/pkg/";

import type { CompilationOutput } from "./types.ts";

const wasm = await init();

export class PdfExporterWrapper {
  #offscreenCanvasContext: OffscreenCanvasRenderingContext2D;
  #exporter: PdfExporter;

  constructor(canvas: OffscreenCanvas, patternData: Uint8Array, fontData: Uint8Array[]) {
    this.#offscreenCanvasContext = canvas.getContext("2d")!;
    this.#exporter = new PdfExporter(patternData, fontData);
  }

  compileDocument(patternPdf: Uint8Array): CompilationOutput<number> {
    return this.#exporter.compileDocument(patternPdf);
  }

  export(patternPdf: Uint8Array): CompilationOutput<Uint8Array> {
    const { output, diagnostics } = this.#exporter.export(patternPdf) as CompilationOutput<number[]>;
    return { output: output === null ? null : new Uint8Array(output), diagnostics };
  }

  preview(page: number) {
    const renderedPage = this.#exporter.preview(page);
    if (!renderedPage) return;

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
