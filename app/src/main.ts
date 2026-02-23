import { vueIntegration } from "@sentry/vue";
import { TauriPluginPinia } from "@tauri-store/pinia";
import { createFluentVue } from "fluent-vue";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import { DiagnosticsService } from "./shared/services/";

import "./assets/styles.css";
import "./assets/icons.ts";

const app = createApp(App);
const pinia = createPinia().use(TauriPluginPinia());
const fluent = createFluentVue({ bundles: [], componentTag: false });

DiagnosticsService.addIntegration(vueIntegration({ app }));

app.use(pinia);
app.use(fluent);

app.mount("#app");
