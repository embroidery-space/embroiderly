import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import { TauriPluginPinia } from "@tauri-store/pinia";

export const pinia = createPinia();
pinia.use(piniaPluginPersistedState);
pinia.use(TauriPluginPinia());

export { usePatternsStore } from "./patterns.ts";
export { usePreferencesStore } from "./preferences.ts";
export { useAppStateStore } from "./state.ts";
