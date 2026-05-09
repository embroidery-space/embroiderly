import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("src/index.ts", import.meta.url)),
      formats: ["es"],
      fileName: "index",
    },
  },
  worker: { format: "es" },
  resolve: {
    alias: {
      "@embroiderly/image-import-wasm": fileURLToPath(new URL("src-wasm/pkg", import.meta.url)),
    },
  },
  optimizeDeps: { exclude: ["@embroiderly/image-import-wasm"] },
});
