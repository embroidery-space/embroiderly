/// <reference types="vitest/config" />

import path from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import vue from "@vitejs/plugin-vue";
import { webdriverio } from "@vitest/browser-webdriverio";
import { storybookVis } from "storybook-addon-vis/vitest-plugin";
import { defineConfig } from "vite";

const isCI = process.env.CI === "true";

export default defineConfig({
  plugins: [vue()],
  css: { modules: { localsConvention: "camelCase" } },
  resolve: {
    alias: {
      "~storybook-utils": path.join(import.meta.dirname, ".storybook/utils"),

      // This is needed for runtime compilation of string templates in tests.
      vue: "vue/dist/vue.esm-bundler.js",
    },
  },
  test: {
    bail: isCI ? 1 : 0,
    reporters: isCI ? ["verbose", "github-actions"] : ["verbose"],
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/composables/**/*.spec.ts", "src/utils/**/*.test.ts"],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(import.meta.dirname, ".storybook") }),
          storybookVis({
            subject: "[data-vis-subject]",
            // Baselines are captured per browser, not per OS/CI-platform.
            snapshotRootDir: ({ rootDir, browserName }) => path.join(rootDir, browserName ?? "unknown"),
            // Flatten the baseline path down to just the component name, so that `src/components/Separator/Separator.stories.ts` becomes `Separator/`.
            snapshotSubpath: ({ subpath }) => {
              const segments = subpath.split("/");
              if (segments[0] === "src") segments.shift();
              if (segments[0] === "components") segments.shift();

              const name = segments.pop()!.replace(/\.stories\.tsx?$/u, "");

              // Most components live in a directory of the same name — don't repeat it.
              if (segments.at(-1) === name) return segments.join("/");

              return [...segments, name].join("/");
            },
          }),
        ],
        test: {
          name: "storybook",
          setupFiles: ["./.storybook/vitest.setup.ts"],
          retry: 3,
          browser: {
            enabled: true,
            headless: true,
            provider: webdriverio({
              capabilities: {
                "ms:edgeOptions": { args: ["--force-device-scale-factor=1"] },
                "moz:firefoxOptions": { prefs: { "layout.css.devPixelsPerPx": "1.0" } },
              },
            }),
            instances: [{ browser: "firefox" }, { browser: "edge" }],
          },
        },
      },
    ],
  },
});
