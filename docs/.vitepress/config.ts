import child from "node:child_process";
import { promisify } from "node:util";

import { withPwa } from "@vite-pwa/vitepress";
import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";

import * as locales from "./locales/";
import { betterAnchors } from "./plugins/";

const HOSTNAME = "https://docs.embroiderly.niusia.me";

const LANGUAGES = ["en", "uk"];
const LANGUAGE_PREFIX_REGEXP = new RegExp(`^(${LANGUAGES.join("|")})/`, "u");

const isCI = process.env.CI === "true";
const isTauri = process.env.TAURI_ENV_TARGET_TRIPLE !== undefined;

const config = defineConfig({
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
    siteTitle: "Embroiderly Docs",
    logo: {
      light: "/app-logo.dark.svg",
      dark: "/app-logo.light.svg",
      alt: "Embroiderly Logo",
    },

    externalLinkIcon: true,
    lastUpdated: {
      formatOptions: {
        forceLocale: true,
        dateStyle: "long",
        timeStyle: "short",
      },
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

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Embroiderly Docs",
      short_name: "Embroiderly Docs",
      description: "A free, open-source, cross-platform desktop application for designing cross-stitch patterns.",
      theme_color: undefined,
    },
    pwaAssets: {
      preset: "minimal-2023",
      overrideManifestIcons: true,
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,ico,png,svg,json,xml,pdf,txt,woff2}"],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB. We have quite large PDF files.
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

    // Compile the documentation as PDF only during development or when releasing the application.
    if (!isCI || isTauri) {
      console.info("Compiling docs as PDFs using Typst");
      await Promise.all(
        LANGUAGES.map((lang) =>
          exec(
            `typst compile .typst/main.typ .vitepress/dist/embroiderly.${lang}.pdf --root . --input lang=${lang} --font-path .typst/fonts/`,
          ),
        ),
      );
    }
  },
});
export default withPwa(config);
