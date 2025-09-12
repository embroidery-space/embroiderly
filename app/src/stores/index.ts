import { createPinia } from "pinia";
import { TauriPluginPinia } from "@tauri-store/pinia";

export const pinia = createPinia();
pinia.use(TauriPluginPinia());
