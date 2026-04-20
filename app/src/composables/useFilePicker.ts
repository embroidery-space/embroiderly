import { createSharedComposable } from "@vueuse/core";
import { showOpenFilePicker, showSaveFilePicker } from "show-open-file-picker";
import type { FilePickerAcceptType } from "show-open-file-picker/types";

export const useFilePicker = createSharedComposable(() => ({
  /**
   * Opens a file picker dialog.
   * Returns the selected handles, or `null` if the user cancelled.
   */
  async open(options: { multiple?: boolean; types?: FilePickerAcceptType[] } = {}) {
    try {
      return await showOpenFilePicker(options);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return null;
      throw e;
    }
  },

  /**
   * Opens a save file picker dialog.
   * Returns the selected handle, or `null` if the user cancelled.
   */
  async save(suggestedName?: string, types?: FilePickerAcceptType[]) {
    try {
      return await showSaveFilePicker({ suggestedName, types });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return null;
      throw e;
    }
  },
}));
