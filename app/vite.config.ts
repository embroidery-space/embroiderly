import { fileURLToPath, URL } from "node:url";

import ui from "@nuxt/ui/vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

import { NuxtUIConfig } from "./ui.config";

export default defineConfig({
  plugins: [vue(), ui(NuxtUIConfig), tailwindcss(), vueDevTools()],
  clearScreen: false,
  resolve: { alias: { "~": fileURLToPath(new URL("./src", import.meta.url)) } },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  server: { port: 1420, strictPort: true, watch: { ignored: ["src-tauri/**"] } },
  build: {
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    chunkSizeWarningLimit: 1000,
  },
});
