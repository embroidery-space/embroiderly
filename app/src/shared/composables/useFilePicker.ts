import { sep } from "@tauri-apps/api/path";
import { open, save } from "@tauri-apps/plugin-dialog";
import type { DialogFilter, OpenDialogOptions, SaveDialogOptions } from "@tauri-apps/plugin-dialog";

import { createSharedComposable, useLocalStorage } from "@vueuse/core";

import { PathApi } from "#shared/api/";

// A utility filter that is appended to any "open" query to allow user to pick any file.
const ALL_FILES_FILTER: DialogFilter = { name: "All Files", extensions: ["*"] };

export type FilePickerOpenOptions = Omit<OpenDialogOptions, "defaultPath">;
export type FilePickerSaveOptions = Omit<SaveDialogOptions, "defaultPath">;

export const useFilePicker = createSharedComposable(() => {
  const lastOpenedFolder = useLocalStorage<string | null>("last-opened-folder", null);
  const lastSavedFolder = useLocalStorage<string | null>("last-saved-folder", null);

  return {
    /** The last opened folder path. */
    lastOpenedFolder,
    /** The last saved folder path. */
    lastSavedFolder,

    /**
     * Opens a file picker dialog.
     * @param options The options for the dialog.
     * @returns The selected file path or null if canceled.
     */
    open: async (options: FilePickerOpenOptions = {}) => {
      lastOpenedFolder.value ??= await PathApi.getAppDocumentDir();

      const { title, multiple = false, directory, recursive, canCreateDirectories } = options;
      const filters = options.filters ? [...options.filters, ALL_FILES_FILTER] : [ALL_FILES_FILTER];

      const path = await open({
        defaultPath: lastOpenedFolder.value,
        title,
        multiple,
        filters,
        directory,
        recursive,
        canCreateDirectories,
      });

      if (path) {
        const first = Array.isArray(path) ? path[0] : path;
        lastOpenedFolder.value = first.slice(0, Math.max(0, first.lastIndexOf(sep())));
      }

      return path;
    },

    /**
     * Opens a save file dialog.
     * @param target The file path to save to.
     * @param options The options for the dialog.
     * @returns The selected file path or null if canceled.
     */
    save: async (target?: string, options?: FilePickerSaveOptions) => {
      lastSavedFolder.value ??= await PathApi.getAppDocumentDir();

      const path = await save({
        defaultPath: target ?? lastSavedFolder.value,
        ...options,
      });

      if (path) {
        lastSavedFolder.value = path.slice(0, Math.max(0, path.lastIndexOf(sep())));
      }

      return path;
    },
  };
});
