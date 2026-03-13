/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />

/** The app version. */
declare const __APP_VERSION__: string;

declare module "virtual:*.ftl" {
  const content: string;
  export default content;
}
