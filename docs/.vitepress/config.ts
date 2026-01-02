import child from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";

import imagemin from "unplugin-imagemin/vite";
import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";

import * as locales from "./locales/";

const LANGUAGES = ["en"];
const HOSTNAME = "https://embroiderly.niusia.me";

export default defineConfig({
  outDir: "./dist/",
  cacheDir: "./cache/",
  srcExclude: ["./*.md"],

  cleanUrls: true,
  lastUpdated: true,

  markdown: {
    typographer: true,
    image: { lazyLoading: true },
  },

  locales: {
    ...locales.docsEn,
  },

  rewrites: {
    "en/:rest*": ":rest*",
  },

  themeConfig: {
    externalLinkIcon: true,
    siteTitle: "Embroiderly",
    logo: {
      light: "/app-logo.dark.svg",
      dark: "/app-logo.light.svg",
      alt: "Embroiderly Logo",
    },
    search: {
      provider: "local",
      options: {
        locales: {
          ...locales.searchEn,
        },
      },
    },
  },

  sitemap: {
    hostname: HOSTNAME,
  },

  vite: {
    plugins: [
      imagemin({
        conversion: [
          { from: "jpg", to: "webp" },
          { from: "png", to: "webp" },
        ],
      }),
      llmstxt({
        workDir: "en/",
        domain: HOSTNAME,
        excludeIndexPage: false,
        ignoreFiles: ["resources/changelog/*"],
      }),
    ],
  },

  async buildEnd() {
    const exec = promisify(child.exec);

    console.info("Compiling docs into PDFs using Typst");
    await Promise.all(
      LANGUAGES.map((lang) =>
        exec(`typst compile .typst/main.typ dist/embroiderly.${lang}.pdf --root . --input lang=${lang}`),
      ),
    );

    // Remove old images. They are processed by `imagemin` and stored in `dist/assets/`.
    await fs.rm("dist/images/", { recursive: true, force: true });
  },
});
