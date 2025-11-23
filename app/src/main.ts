import ui from "@nuxt/ui/vue-plugin";
import { vueIntegration } from "@sentry/vue";
import { createFluentVue } from "fluent-vue";
import { createApp } from "vue";

import { router } from "./app/";
import App from "./App.vue";
import { ShortcutsDirective } from "./directives/";
import { DiagnosticsService } from "./shared/services/";
import { pinia } from "./stores/";

const app = createApp(App);
const fluent = createFluentVue({ bundles: [], componentTag: false });

DiagnosticsService.addIntegration(vueIntegration({ app }));

app.use(router);
app.use(pinia);
app.use(fluent);
app.use(ui);
app.directive("shortcuts", ShortcutsDirective);

app.mount("#app");
