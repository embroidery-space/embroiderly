import { TauriPluginPinia } from "@tauri-store/pinia";
import { createFluentVue } from "fluent-vue";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";

import "./assets/styles.css";

const app = createApp(App);
const pinia = createPinia().use(TauriPluginPinia());
const fluent = createFluentVue({ bundles: [], componentTag: false });

app.use(pinia);
app.use(fluent);

app.mount("#app");
