/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    include: ["./src/**/*.test.ts"],
    exclude: ["./tests/**"],

    globals: true,
    environment: "jsdom",
    bail: process.env.GITHUB_ACTIONS ? 1 : 0,
    reporters: process.env.GITHUB_ACTIONS ? ["verbose", "github-actions"] : ["verbose"],
    coverage: {
      reporter: process.env.GITHUB_ACTIONS ? ["text", "lcov"] : ["text"],
    },
  },
});
