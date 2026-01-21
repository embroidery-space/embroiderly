/// <reference types="histoire" />

import { HstVue } from "@histoire/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
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
});
