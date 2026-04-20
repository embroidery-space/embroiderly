import { TauriPluginPinia } from "@tauri-store/pinia";
import { createFluentVue } from "fluent-vue";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import { EditorContextKey } from "./composables/";
import { initEditor } from "./wasm/";

import "./assets/styles.css";

const editorContext = await initEditor();

const app = createApp(App);

app.provide(EditorContextKey, editorContext);

const pinia = createPinia().use(TauriPluginPinia());
const fluent = createFluentVue({ bundles: [], componentTag: false });

app.use(pinia);
app.use(fluent);

app.mount("#app");
