import { TauriPluginPinia } from "@tauri-store/pinia";
import { createPinia } from "pinia";

export const pinia = createPinia();
pinia.use(TauriPluginPinia());
