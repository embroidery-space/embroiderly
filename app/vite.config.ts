/// <reference types="vitest/config" />

import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { webdriverio } from "@vitest/browser-webdriverio";
import { FileSystemIconLoader } from "unplugin-icons/loaders";
import icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

import pkg from "./package.json";
import fluentMerge from "./vite-plugins/fluent-merge";

const isCI = !!process.env.CI;
const isTauri = !!process.env.TAURI_ENV_TARGET_TRIPLE;

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

export default defineConfig({
  plugins: [
    vue(),
    icons({
      compiler: "vue3",
      customCollections: {
        stitches: FileSystemIconLoader("./src/assets/icons/stitches"),
        window: FileSystemIconLoader("./src/assets/icons/window"),
      },
    }),
    tailwindcss(),
    fluentMerge({ localesDir: "./src/assets/locales/" }),
    !isTest && vueDevTools(),
  ],
  clearScreen: false,
  optimizeDeps: { exclude: ["@embroiderly/wasm", "@embroiderly/pdf-export"] },
  worker: { format: "es" },
  server: { port: 1420, strictPort: true, watch: { ignored: ["src-tauri/**", "src-wasm/**"] } },
  build: {
    sourcemap: isDev,
    chunkSizeWarningLimit: Infinity,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __TAURI__: isTauri,
  },
  resolve: {
    dedupe: ["@vueuse/*", "reka-ui", "vue"],
    alias: {
      "~": fileURLToPath(new URL("src", import.meta.url)),
      "~test-utils": fileURLToPath(new URL("tests/components/utils", import.meta.url)),
      "@embroiderly/wasm": fileURLToPath(new URL("src-wasm/pkg", import.meta.url)),
    },
  },
  test: {
    bail: isCI ? 1 : 0,
    reporters: isCI ? ["verbose", "github-actions"] : ["verbose"],

    projects: [
      {
        test: {
          name: "unit",
          include: ["./src/**/*.spec.ts"],
          exclude: ["./src/components/**/*.spec.ts"],
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
          include: ["./src/components/**/*.spec.ts"],
          setupFiles: ["vitest-browser-vue", "./tests/components/vitest.setup.ts"],
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
