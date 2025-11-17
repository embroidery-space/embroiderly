import { defaultSentryOptions } from "@embroiderly/tauri-plugin-sentry";

import ui from "@nuxt/ui/vue-plugin";
import { createFluentVue } from "fluent-vue";
import { createApp } from "vue";

import "./assets/styles.css";
import "./assets/icons.ts";

import App from "./App.vue";
import { ShortcutsDirective } from "./directives/";
import { initLogger } from "./logger.ts";
import { router } from "./router.ts";
import { pinia } from "./stores/";
import { sentry } from "./vendor/";

const app = createApp(App);
const fluent = createFluentVue({ bundles: [], componentTag: false });

initLogger();
sentry.init({ ...defaultSentryOptions, app });

app.use(router);
app.use(pinia);
app.use(fluent);
app.use(ui);
app.directive("shortcuts", ShortcutsDirective);

app.mount("#app");
