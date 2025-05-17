/// <reference types="vitest" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  clearScreen: false,
  resolve: { alias: { "#": fileURLToPath(new URL("./src", import.meta.url)) } },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  server: { port: 1420, strictPort: true, watch: { ignored: ["src-tauri/**"] } },
  build: {
    target: ["es2020", process.env.TAURI_ENV_PLATFORM == "windows" ? "chrome105" : "safari14"],
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    bail: process.env.GITHUB_ACTIONS ? 1 : 0,
    reporters: process.env.GITHUB_ACTIONS ? ["verbose", "github-actions"] : ["verbose"],
  },
});
