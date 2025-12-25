import { cloudflareRedirect } from "vite-plugin-cloudflare-redirect";
import { defineConfig } from "vitepress";

import * as locales from "./locales/";

export default defineConfig({
  outDir: "./dist/",
  cacheDir: "./cache/",

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
    plugins: [cloudflareRedirect()],
  },
});
