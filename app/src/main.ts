import ui from "@nuxt/ui/vue-plugin";
import { vueIntegration } from "@sentry/vue";
import { createFluentVue } from "fluent-vue";
import { createApp } from "vue";

import { router, pinia } from "./app/";
import App from "./App.vue";
import { shortcuts } from "./plugins/";
import { DiagnosticsService } from "./shared/services/";

const app = createApp(App);
const fluent = createFluentVue({ bundles: [], componentTag: false });

DiagnosticsService.addIntegration(vueIntegration({ app }));

app.use(router);
app.use(pinia);
app.use(fluent);
app.use(ui);
app.use(shortcuts);

app.mount("#app");
