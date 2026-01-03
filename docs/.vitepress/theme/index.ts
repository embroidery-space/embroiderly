import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";

import DownloadWidget from "../components/DownloadWidget.vue";

import "./assets/styles.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("DownloadWidget", DownloadWidget);
  },
} satisfies Theme;
