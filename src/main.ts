import { createApp } from "vue";
import ui from "@nuxt/ui/vue-plugin";
import PrimeVue from "primevue/config";
import * as Sentry from "@sentry/vue";
import { defaultSentryOptions } from "@embroiderly/tauri-plugin-sentry";

import "./assets/styles.css";
import "./assets/icons.ts";

import { router } from "./router.ts";
import { pinia } from "./stores/";
import { ShortcutsDirective } from "./directives/";
import { fluent } from "./fluent.ts";
import { initLogger } from "./logger.ts";
import App from "./App.vue";

initLogger();

const app = createApp(App);

Sentry.init({
  app,
  // Specify a dummy DSN to correctly setup Sentry.
  // Requests will be handled by the Tauri backend.
  dsn: "https://123456@dummy.dsn/0",
  debug: import.meta.env.DEV,
  ...defaultSentryOptions,
});

app.use(router);
app.use(pinia);
app.use(fluent);
app.use(ui);
app.use(PrimeVue, { unstyled: true });
app.directive("shortcuts", ShortcutsDirective);

app.config.errorHandler = (err, _instance, info) => {
  error(`Error (${info}): ${err}`);
};
app.config.warnHandler = (msg, _instance, trace) => {
  warn(`Warning: ${msg}.\nTrace: ${trace}`);
};

app.mount("#app");
