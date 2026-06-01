import { vueIntegration } from "@sentry/vue";
import { createFluentVue } from "fluent-vue";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
import { createApp } from "vue";

import App from "./App.vue";
import { EditorContextKey } from "./composables/";
import { DiagnosticsService } from "./services/";
import { initEditor } from "./wasm/";

import "driver.js/dist/driver.css";
import "./assets/styles.css";

const editorContext = await initEditor();

const app = createApp(App);

app.provide(EditorContextKey, editorContext);

const pinia = createPinia().use(createPersistedState());
const fluent = createFluentVue({ bundles: [], componentTag: false });

DiagnosticsService.addIntegration(vueIntegration({ app }));

app.use(pinia);
app.use(fluent);

app.mount("#app");
