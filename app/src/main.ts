import { vueIntegration } from "@sentry/vue";
import { createFluentVue } from "fluent-vue";
import { createApp } from "vue";

import { pinia } from "./app/";
import App from "./App.vue";
import { DiagnosticsService } from "./shared/services/";

const app = createApp(App);
const fluent = createFluentVue({ bundles: [], componentTag: false });

DiagnosticsService.addIntegration(vueIntegration({ app }));

app.use(pinia);
app.use(fluent);

app.mount("#app");
