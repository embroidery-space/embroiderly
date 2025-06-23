import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import { TauriPluginPinia } from "@tauri-store/pinia";

export const pinia = createPinia();
pinia.use(piniaPluginPersistedState);
pinia.use(TauriPluginPinia());
