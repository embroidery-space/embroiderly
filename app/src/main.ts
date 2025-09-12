import { createApp } from "vue";
import ui from "@nuxt/ui/vue-plugin";
import PrimeVue from "primevue/config";
import { defaultSentryOptions } from "@embroiderly/tauri-plugin-sentry";

import "./assets/styles.css";
import "./assets/icons.ts";

import { router } from "./router.ts";
import { pinia } from "./stores/";
import { ShortcutsDirective } from "./directives/";
import { fluent } from "./fluent.ts";
import { initLogger } from "./logger.ts";
import { sentry } from "./vendor/";
import App from "./App.vue";

const app = createApp(App);

initLogger();
sentry.init({ ...defaultSentryOptions, app });

app.use(router);
app.use(pinia);
app.use(fluent);
app.use(ui);
app.use(PrimeVue, { unstyled: true });
app.directive("shortcuts", ShortcutsDirective);

app.mount("#app");
