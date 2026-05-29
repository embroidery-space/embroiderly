/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vue" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/pwa-assets" />
/// <reference types="unplugin-icons/types/vue" />
/// <reference types="pinia-plugin-persistedstate" />

/** The app version. */
declare const __APP_VERSION__: string;

/** Short Git commit hash. */
declare const __GIT_COMMIT__: string;

/** Git branch name. */
declare const __GIT_BRANCH__: string;

/** ISO 8601 timestamp of the HEAD commit. */
declare const __GIT_DATE__: string;

/** Whether the app is running in Tauri. */
declare const __TAURI__: boolean;

interface Window {
  /** File paths injected by the Tauri backend for file association handling. */
  openedFiles?: string[];
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_EMBROIDERLY_SENTRY_DSN?: string;
  readonly VITE_EMBROIDERLY_POSTHOG_API_KEY?: string;
}
