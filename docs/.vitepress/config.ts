import child from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";

import imagemin from "unplugin-imagemin/vite";
import { cloudflareRedirect } from "vite-plugin-cloudflare-redirect";
import { defineConfig } from "vitepress";

import * as locales from "./locales/";

const LANGUAGES = Object.freeze(["en"]);

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

  themeConfig: {
    siteTitle: "Embroiderly",
    logo: {
      light: "/app-logo.dark.svg",
      dark: "/app-logo.light.svg",
      alt: "Embroiderly Logo",
    },
    externalLinkIcon: true,
  },

  vite: {
    plugins: [
      cloudflareRedirect(),
      imagemin({
        conversion: [
          { from: "jpg", to: "webp" },
          { from: "png", to: "webp" },
        ],
      }),
    ],
  },

  async buildEnd() {
    const exec = promisify(child.exec);

    console.info("Compiling docs into PDFs using Typst");
    await Promise.all(
      LANGUAGES.map((lang) =>
        exec(`typst compile .typst/main.typ dist/${lang}/embroiderly.pdf --root . --input lang=${lang}`),
      ),
    );

    // Remove old images. They are processed by `imagemin` and stored in `dist/assets/`.
    await fs.rm("dist/images", { recursive: true, force: true });
  },
});
