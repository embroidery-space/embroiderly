import { sep } from "@tauri-apps/api/path";
import { open, save } from "@tauri-apps/plugin-dialog";
import type { DialogFilter, OpenDialogOptions, SaveDialogOptions } from "@tauri-apps/plugin-dialog";
import { createSharedComposable, useLocalStorage } from "@vueuse/core";

import { PathApi } from "~/api/";

const ANY_PATTERN_FILTER: DialogFilter[] = [
  { name: "Cross-Stitch Patterns", extensions: ["embproj", "oxs", "xsd"] },
  { name: "All Files", extensions: ["*"] },
];
const EMBPROJ_FILTER: DialogFilter[] = [{ name: "Embroidery Project", extensions: ["embproj"] }];
const OXS_FILTER: DialogFilter[] = [{ name: "OXS", extensions: ["oxs"] }];

const ANY_IMAGE_FILTER: DialogFilter[] = [
  { name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] },
  { name: "All Files", extensions: ["*"] },
];

const PDF_FILTER: DialogFilter[] = [{ name: "PDF", extensions: ["pdf"] }];

export const useFilePicker = createSharedComposable(() => {
  const lastOpenedFolder = useLocalStorage<string | null>("last-opened-folder", null);
  const lastSavedFolder = useLocalStorage<string | null>("last-saved-folder", null);

  return {
    /** The filter that accepts any supported pattern file. */
    ANY_PATTERN_FILTER,
    /** The filter for Embroiderly Project files. */
    EMBPROJ_FILTER,
    /** The filter for OXS files. */
    OXS_FILTER,

    /** The filter that accepts any supported image file. */
    ANY_IMAGE_FILTER,

    /** The filter for PDF files. */
    PDF_FILTER,

    /** The last opened folder path. */
    lastOpenedFolder,
    /** The last saved folder path. */
    lastSavedFolder,

    /**
     * Opens a file picker dialog.
     * @param options The options for the dialog.
     * @returns The selected file path or null if canceled.
     */
    open: async (options?: Omit<OpenDialogOptions, "defaultPath">) => {
      lastOpenedFolder.value ??= await PathApi.getAppDocumentDir();

      const path = await open({
        defaultPath: lastOpenedFolder.value,
        multiple: false,
        ...options,
      });

      if (path) {
        lastOpenedFolder.value = path.substring(0, path.lastIndexOf(sep()));
      }

      return path;
    },

    /**
     * Opens a save file dialog.
     * @param target The default file path to save to.
     * @param options The options for the dialog.
     * @returns The selected file path or null if canceled.
     */
    save: async (target: string, options?: Omit<SaveDialogOptions, "defaultPath">) => {
      const path = await save({
        defaultPath: target,
        ...options,
      });

      if (path) {
        lastOpenedFolder.value = path.substring(0, path.lastIndexOf(sep()));
      }

      return path;
    },
  };
});
