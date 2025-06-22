import { createApp } from "vue";
import ui from "@nuxt/ui/vue-plugin";

import PrimeVue from "primevue/config";
import { ConfirmationService } from "primevue";

import "./assets/styles.css";
import { NordTheme } from "./assets/theme/";

import { router } from "./router.ts";
import { pinia } from "./stores/";
import { ShortcutsDirective } from "./directives/";
import { fluent } from "./fluent.ts";
import { initLogger } from "./logger.ts";
import App from "./App.vue";

initLogger();

const app = createApp(App);
app.use(router);
app.use(pinia);
app.use(fluent);
app.use(ui);
app.use(PrimeVue, { theme: { preset: NordTheme } });
app.use(ConfirmationService);
app.directive("shortcuts", ShortcutsDirective);

app.config.errorHandler = (err, _instance, info) => {
  error(`Error (${info}): ${err}`);
};
app.config.warnHandler = (msg, _instance, trace) => {
  warn(`Warning: ${msg}.\nTrace: ${trace}`);
};

app.mount("#app");
