import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { useTauriListener } from "~/composables/tauri/";

import { useCloseAllPatterns } from "./useCloseAllPatterns.ts";

/**
 * Attaches a close guard to the window:
 * - In Tauri, prompting the user to save any dirty patterns before closing.
 * - In browser, no actions are taken (open patterns are restored next time).
 */
export function useCloseGuard() {
  const { closeAllPatterns } = useCloseAllPatterns();

  if (__TAURI__) {
    // In Tauri, if the close listener is attached, the window is automatically prevented from closing until the callback is executed.
    // During the hook, we iterate over the open patterns and prompt the user to save any dirty patterns.
    useTauriListener(
      getCurrentWebviewWindow().onCloseRequested(async (event) => {
        const closed = await closeAllPatterns();
        if (!closed) event.preventDefault();
      }),
    );
  }

  // There is no clean way to intercept the close event and perform arbitrary actions in the browser.
  // So, do nothing and just let open patterns to be restored next time, since app state is stored in IndexedDB.
}
