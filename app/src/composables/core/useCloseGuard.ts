import { useConfirm } from "@embroiderly/ui";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { toRaw } from "vue";

import { useI18n } from "~/composables/";
import { useTauriListener } from "~/composables/tauri/";
import { usePatternFileStore } from "~/stores/";

/**
 * Attaches a close guard to the window:
 * - In browser, warning the user about unsaved changes before closing.
 * - In Tauri, prompting the user to save any dirty patterns before closing.
 */
export function useCloseGuard() {
  const confirm = useConfirm();
  const { fluent } = useI18n();

  const patternFileStore = usePatternFileStore();

  if (__TAURI__) {
    // In Tauri, if the close listener is attached, the window is automatically prevented from closing until the callback is executed.
    // During the hook, we iterate over the open patterns and prompt the user to save any dirty patterns.
    useTauriListener(
      getCurrentWebviewWindow().onCloseRequested(async (event) => {
        const patterns = structuredClone(toRaw(patternFileStore.openedPatterns).map((op) => toRaw(op)));
        for (const pattern of patterns) {
          if (pattern.dirty) {
            const accepted = await confirm.open(fluent.$ta("unsaved-changes", { pattern: pattern.title })).result;
            if (accepted === undefined) {
              event.preventDefault();
              return;
            } else if (accepted) {
              const saved = await patternFileStore.savePattern(pattern.id);
              if (!saved) {
                event.preventDefault();
                return;
              }
            }
          }
          await patternFileStore.closePattern(pattern.id, { force: true });
        }
      }),
    );
  }

  // In browser, we always persist the state in the IndexedDB.
  // Also, there is no way to clean up the state before closing the tab.
  // Therefore, it is easier to simply restore the session on startup (what we actually do).
}
