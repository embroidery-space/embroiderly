/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />
/// <reference types="pinia-plugin-persistedstate" />

/** The app version. */
declare const __APP_VERSION__: string;

/** Whether the app is running in Tauri. */
declare const __TAURI__: boolean;

interface Window {
  /** File paths injected by the Tauri backend for file association handling. */
  openedFiles?: string[];
}

declare module "virtual:*.ftl" {
  const content: string;
  export default content;
}
