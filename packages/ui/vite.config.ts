/// <reference types="histoire" />
/// <reference types="vitest/config" />

import { HstVue } from "@histoire/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { webdriverio } from "@vitest/browser-webdriverio";
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
        light: "./.histoire/images/app-logo.light.svg",
        dark: "./.histoire/images/app-logo.dark.svg",
      },
      logoHref: "https://ui.embroiderly.niusia.me",
    },

    tree: {
      groups: [
        { id: "overview", title: "" },
        { id: "general", title: "General" },
        { id: "layout", title: "Layout" },
        { id: "element", title: "Element" },
        { id: "form", title: "Form" },
        { id: "navigation", title: "Navigation" },
        { id: "overlay", title: "Overlay" },
      ],
    },
  },
  test: {
    bail: isCI ? 1 : 0,
    reporters: isCI ? ["verbose", "github-actions"] : ["verbose"],
    setupFiles: ["./vitest.setup.ts", "vitest-browser-vue"],
    browser: {
      enabled: true,
      headless: isCI,
      provider: webdriverio(),
      instances: [{ browser: "edge" }],
    },
  },
});
