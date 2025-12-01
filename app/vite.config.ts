import { fileURLToPath, URL } from "node:url";

import ui from "@nuxt/ui/vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

import { NuxtUIConfig } from "./ui.config";
import fluentMerge from "./vite-plugins/fluent-merge";

export default defineConfig({
  plugins: [vue(), ui(NuxtUIConfig), tailwindcss(), fluentMerge({ localesDir: "./src/app/locales/" }), vueDevTools()],
  clearScreen: false,
  resolve: {
    alias: {
      "~/pattern-editor": fileURLToPath(new URL("src/modules/pattern-editor", import.meta.url)),
      "~/shared": fileURLToPath(new URL("src/shared", import.meta.url)),
    },
  },
  envPrefix: ["VITE_", "TAURI_ENV_"],
  server: { port: 1420, strictPort: true, watch: { ignored: ["src-tauri/**"] } },
  build: {
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    chunkSizeWarningLimit: 1000,
  },
});
