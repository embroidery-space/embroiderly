import { HstVue } from "@histoire/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "histoire";

export default defineConfig({
  plugins: [HstVue()],
  setupFile: "./histoire.setup.ts",

  outDir: "./dist/",

  vite: {
    plugins: [vue(), tailwindcss()],
  },
});
