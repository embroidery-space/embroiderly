/// <reference types="vitest/config" />

import ui from "@nuxt/ui/vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { webdriverio } from "@vitest/browser-webdriverio";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

import { NuxtUIConfig } from "./ui.config";
import fluentMerge from "./vite-plugins/fluent-merge";

const isCI = process.env.CI === "true";
const isDebug = process.env.TAURI_ENV_DEBUG === "true";

export default defineConfig({
  plugins: [vue(), ui(NuxtUIConfig), tailwindcss(), fluentMerge({ localesDir: "./src/app/locales/" }), vueDevTools()],
  clearScreen: false,
  envPrefix: ["VITE_", "TAURI_ENV_"],
  server: { port: 1420, strictPort: true, watch: { ignored: ["src-tauri/**"] } },
  build: {
    sourcemap: isDebug,
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    dedupe: ["@vueuse/*", "reka-ui", "vue"],
  },
  test: {
    bail: isCI ? 1 : 0,
    reporters: isCI ? ["verbose", "github-actions"] : ["verbose"],

    projects: [
      {
        test: {
          name: "unit",
          include: ["./src/**/*.test.ts"],
          exclude: ["./src/shared/components/**/*.test.ts", "./src/modules/*/components/**/*.test.ts"],
        },
      },
      {
        extends: true,
        resolve: {
          alias: {
            // This is needed for runtime compilation of string templates in tests.
            vue: "vue/dist/vue.esm-bundler.js",
          },
        },
        test: {
          name: "components",
          include: ["./src/shared/components/**/*.test.ts", "./src/modules/*/components/**/*.test.ts"],
          setupFiles: ["./tests/components/test-setup.ts", "vitest-browser-vue"],
          browser: {
            enabled: true,
            headless: isCI,
            provider: webdriverio(),
            instances: [
              { browser: "edge" }, // Windows.
              // Since we currently do not support macOS
              // and there is no way to install Safari on other platforms,
              // keep this option commented for the future.
              // { browser: "safari" }, // macOS and Linux.
            ],
          },
        },
      },
    ],

    coverage: {
      reporter: isCI ? ["text", "lcov"] : ["text"],
      exclude: ["./src/app/"],
    },
  },
});
