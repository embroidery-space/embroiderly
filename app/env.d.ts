/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />

/** The app version. */
declare const __APP_VERSION__: string;

/** Whether the app is running in Tauri. */
declare const __TAURI__: boolean;

declare module "virtual:*.ftl" {
  const content: string;
  export default content;
}
