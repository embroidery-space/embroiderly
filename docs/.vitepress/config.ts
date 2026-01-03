import child from "node:child_process";
import { promisify } from "node:util";

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
      llmstxt({
        workDir: "en/",
        domain: HOSTNAME,
        excludeIndexPage: false, // Not all index files should be excluded.
        ignoreFiles: ["index.md", "resources/*"],
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
  },
});
