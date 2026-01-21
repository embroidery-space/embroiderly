/// <reference types="histoire" />
/// <reference types="vitest/config" />

import { HstVue } from "@histoire/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";

const isCI = process.env.CI === "true";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      // This is needed for runtime compilation of string templates in tests.
      vue: "vue/dist/vue.esm-bundler.js",
    },
  },
  histoire: {
    plugins: [HstVue()],
    setupFile: "./histoire.setup.ts",

    outDir: "./dist/",

    theme: {
      title: "Embroiderly UI",
      favicon: "favicon.ico",
      logo: {
        light: "./public/app-logo.dark.svg",
        dark: "./public/app-logo.light.svg",
      },
      logoHref: "https://ui.embroiderly.niusia.me",
    },
  },
  test: {
    bail: isCI ? 1 : 0,
    reporters: isCI ? ["verbose", "github-actions"] : ["verbose"],
    setupFiles: ["./tests/components-setup.ts", "vitest-browser-vue"],
    browser: {
      enabled: true,
      headless: isCI,
      provider: playwright(),
      instances: [
        { browser: "chromium" }, // Windows.
        { browser: "webkit" }, // macOS and Linux.
      ],
    },
  },
});
