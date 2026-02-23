/// <reference types="vitest/config" />

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const isCI = process.env.CI === "true";

export default defineConfig({
  plugins: [vue()],
  test: {
    bail: isCI ? 1 : 0,
    reporters: isCI ? ["verbose", "github-actions"] : ["verbose"],
  },
});
