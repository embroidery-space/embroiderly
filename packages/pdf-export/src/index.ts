import * as Comlink from "comlink";

import type { ExportInput } from "./types.ts";

export * from "./types.ts";

export async function exportPatternAsPdf(input: ExportInput): Promise<Uint8Array> {
  const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  const api = Comlink.wrap<{ export: (input: ExportInput) => Promise<Uint8Array> }>(worker);
  try {
    const transferables: Transferable[] = [
      input.pattern.buffer as ArrayBuffer,
      input.options.buffer as ArrayBuffer,
      ...input.fonts.map((f) => f.buffer as ArrayBuffer),
    ];
    return await api.export(Comlink.transfer(input, transferables));
  } finally {
    api[Comlink.releaseProxy]();
    worker.terminate();
  }
}
