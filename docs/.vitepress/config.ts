import child from "node:child_process";
import { promisify } from "node:util";

import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";

import * as locales from "./locales/";
import { betterAnchors } from "./plugins/";

const HOSTNAME = "https://embroiderly.niusia.me";

const LANGUAGES = ["en", "uk"];
const LANGUAGE_PREFIX_REGEXP = new RegExp(`^(${LANGUAGES.join("|")})/`);

export default defineConfig({
  outDir: "./dist/",
  cacheDir: "./cache/",

  cleanUrls: true,
  lastUpdated: true,
  metaChunk: true,

  markdown: {
    typographer: true,
    image: { lazyLoading: true },
    config(md) {
      md.use(betterAnchors);
    },
  },

  locales: {
    ...locales.docsEn,
    ...locales.docsUk,
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
          ...locales.searchUk,
        },
        async _render(src, env, md) {
          const html = await md.renderAsync(src, env);

          const relativePath = env.relativePath.replace(LANGUAGE_PREFIX_REGEXP, "");
          if (relativePath.startsWith("resources/")) return "";

          return html;
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
        ignoreFiles: ["resources/**/*"],
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
