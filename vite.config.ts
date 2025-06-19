/* eslint-disable @typescript-eslint/no-explicit-any */

/// <reference types="vitest" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";
import vue from "@vitejs/plugin-vue";
import ui from "@nuxt/ui/vite";
import tailwindcss from "@tailwindcss/vite";

const FORM_FIELD_DEFAULT_VARIANTS: any = {
  size: "xl",
  color: "neutral",
  variant: "subtle",
  orientation: "vertical", // for input number
};
const CHECKBOX_DEFAULT_VARIANTS: any = {
  size: "xl",
  color: "neutral",
  variant: "list",
  indicator: "start",
};

export default defineConfig({
  plugins: [
    vueDevTools(),
    vue(),
    ui({
      theme: { colors: ["primary"] },
      ui: {
        colors: {
          primary: "primary",
        },
        button: {
          slots: {
            base: "text-base font-normal hover:cursor-pointer",
          },
          variants: {
            variant: {
              link: "text-base",
            },
            size: {
              md: {
                base: "text-base",
              },
            },
          },
        },
        modal: {
          slots: {
            overlay: "bg-black/50",
          },
        },
        checkbox: { defaultVariants: CHECKBOX_DEFAULT_VARIANTS },
        inputNumber: { defaultVariants: FORM_FIELD_DEFAULT_VARIANTS },
        select: { defaultVariants: FORM_FIELD_DEFAULT_VARIANTS },
      },
    }),
    tailwindcss(),
  ],
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
