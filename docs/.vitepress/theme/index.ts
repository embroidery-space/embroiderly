import VPSwiper from "@cssnr/vitepress-swiper";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";

import DownloadWidget from "./components/DownloadWidget.vue";

import "@cssnr/vitepress-swiper/style.css";
import "./assets/styles.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("VPSwiper", VPSwiper);

    app.component("DownloadWidget", DownloadWidget);
  },
} satisfies Theme;
