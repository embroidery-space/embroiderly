/// <reference types="vitest/config" />

import { execSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { webdriverio } from "@vitest/browser-webdriverio";
import { FileSystemIconLoader } from "unplugin-icons/loaders";
import icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import vueDevTools from "vite-plugin-vue-devtools";

import pkg from "./package.json";
import fluentMerge from "./vite-plugins/fluent-merge";

const git = (() => {
  try {
    const commit = execSync("git rev-parse --short HEAD").toString().trim();
    const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    const date = execSync("git log -1 --format=%cI").toString().trim();
    return { commit, branch, date };
  } catch {
    return { commit: "unknown", branch: "unknown", date: new Date().toISOString() };
  }
})();

const isCI = !!process.env.CI;
const isTauri = !!process.env.TAURI_ENV_TARGET_TRIPLE;

// CI sets this to "false" for short-lived preview deployments. Default: enabled.
const isPwaEnabled = process.env.EMBROIDERLY_PWA !== "false";

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
    !isTauri &&
      VitePWA({
        disable: !isPwaEnabled,
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        registerType: "prompt",
        injectRegister: false,
        manifest: {
          name: "Embroiderly",
          short_name: "Embroiderly",
          description: "A free, open-source, cross-platform desktop application for designing cross-stitch patterns.",
          theme_color: undefined,
        },
        pwaAssets: {
          preset: "minimal-2023",
          overrideManifestIcons: true,
        },
        injectManifest: {
          globPatterns: ["**/*.{js,wasm,css,html,ico,png,svg,json,ttf,otf}"],
          maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30 MB. We have quite large Wasm modules.
        },
      }),
    !isTest && vueDevTools(),
  ],
  clearScreen: false,
  optimizeDeps: { exclude: ["@embroiderly/wasm", "@embroiderly/pdf-export", "@embroiderly/image-import"] },
  worker: { format: "es" },
  server: { port: 1420, strictPort: true, watch: { ignored: ["src-tauri/**", "src-wasm/**"] } },
  build: {
    sourcemap: isCI ? "hidden" : isDev,
    chunkSizeWarningLimit: Infinity,
    cssCodeSplit: false, // Embroiderly is SPA; compile all styles into a single CSS file.
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GIT_COMMIT__: JSON.stringify(git.commit),
    __GIT_BRANCH__: JSON.stringify(git.branch),
    __GIT_DATE__: JSON.stringify(git.date),
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
              (() => {
                if (process.platform === "win32") return { browser: "edge" };
                if (process.platform === "linux") return { browser: "firefox" };
                if (process.platform === "darwin") return { browser: "safari" };
                throw new Error("Unsupported platform for browser testing");
              })(),
            ],
          },
        },
      },
    ],
  },
});
