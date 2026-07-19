/// <reference types="histoire" />
/// <reference types="vitest/config" />

import path from "node:path";

import { HstVue } from "@histoire/plugin-vue";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { webdriverio } from "@vitest/browser-webdriverio";
import { storybookVis } from "storybook-addon-vis/vitest-plugin";
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
        { id: "toolbar", title: "Toolbar" },
        { id: "data", title: "Data" },
        { id: "navigation", title: "Navigation" },
        { id: "overlay", title: "Overlay" },
      ],
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
            snapshotRootDir: ({ rootDir }) => rootDir,
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
