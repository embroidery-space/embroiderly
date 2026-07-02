import type { UnlistenFn } from "@tauri-apps/api/event";

import { onUnmounted } from "vue";

/**
 * Simplifies the usage of Tauri event listeners by unlistening to them on unmounting.
 *
 * **Example:**
 * ```ts
 * const appWindow = getCurrentWebviewWindow();
 * useTauriListener(appWindow.listen("event_name", () => {}));
 * useTauriListener(appWindow.onCloseRequested(() => {}));
 * ```
 *
 * @param unlisten A promise that resolves to a function to unlisten to the event.
 */
export function useTauriListener(unlisten: Promise<UnlistenFn> | (() => Promise<UnlistenFn>)) {
  const promise = typeof unlisten === "function" ? unlisten() : unlisten;
  onUnmounted(() => promise.then((unlisten) => unlisten()).catch(() => {}));
}
