import * as Comlink from "comlink";

import init, { ImageImportSession } from "../src-wasm/pkg/";

let initialized = false;
let session: ImageImportSession | null = null;

const api = {
  async start(imageBytes: Uint8Array) {
    if (!initialized) {
      await init();
      initialized = true;
    }

    session = new ImageImportSession(imageBytes);

    // Destructure the received result to build a clean JS object instead of using the Wasm wrapper.
    const { width, height } = session.imageDimensions();
    return { width, height };
  },

  getPreview(paletteBytes: Uint8Array, optionsBytes: Uint8Array) {
    if (!session) throw new Error("Image import session has not been started");
    return session.getPreview(paletteBytes, optionsBytes);
  },
};
Comlink.expose(api);
