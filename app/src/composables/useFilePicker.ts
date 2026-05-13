import { createSharedComposable } from "@vueuse/core";
import { showOpenFilePicker, showSaveFilePicker } from "show-open-file-picker";
import type {
  FilePickerAcceptType,
  ShowOpenFilePickerOptions,
  ShowSaveFilePickerOptions,
} from "show-open-file-picker/types";

type OpenReturn<T extends ShowOpenFilePickerOptions> =
  | (T["multiple"] extends true ? FileSystemFileHandle[] : FileSystemFileHandle)
  | null;

export const useFilePicker = createSharedComposable(() => ({
  ids: {
    pattern: "patterns",
    palette: "palettes",
    font: "fonts",
    image: "images",
    pdf: "patterns", // PDFs should colocated with their source patterns.
  },

  filters: {
    /** Matches any supported pattern types (`.embproj`, `.oxs`, `.xsd`). */
    pattern: [
      {
        description: "Cross-Stitch Patterns",
        accept: { "application/octet-stream": [".embproj", ".oxs", ".xsd"] },
      },
    ] satisfies FilePickerAcceptType[],

    /** Matches `.embproj` patterns. */
    embproj: [
      {
        description: "Embroidery Project",
        accept: { "application/octet-stream": [".embproj"] },
      },
    ] satisfies FilePickerAcceptType[],

    /** Matches `.oxs` patterns. */
    oxs: [
      {
        description: "OXS",
        accept: { "application/octet-stream": [".oxs"] },
      },
    ] satisfies FilePickerAcceptType[],

    /** Matches any supported image types (`.png`, `.jpg`, `.jpeg`, `.webp`). */
    image: [
      {
        description: "Images",
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
      },
    ] satisfies FilePickerAcceptType[],

    /** Matches `.pdf` documents. */
    pdf: [
      {
        description: "PDF",
        accept: { "application/pdf": [".pdf"] },
      },
    ] satisfies FilePickerAcceptType[],

    /** Matches any supported palette types (`.master`, `.user`, `.rng`, `.threads`, `.json`). */
    palette: [
      {
        description: "Palette files",
        accept: {
          "application/octet-stream": [".master", ".user", ".rng"],
          "text/plain": [".threads"],
          "application/json": [".json"],
        },
      },
    ] satisfies FilePickerAcceptType[],

    /** Matches any supported font types (`.ttf`, `.otf`). */
    font: [
      {
        description: "Font files",
        accept: { "font/*": [".ttf", ".otf"] },
      },
    ] satisfies FilePickerAcceptType[],
  },

  /**
   * Opens a file picker dialog.
   * Returns the selected handle(s), or `null` if the user cancelled.
   */
  async open<T extends ShowOpenFilePickerOptions>(options?: T): Promise<OpenReturn<T>> {
    try {
      const handles = await showOpenFilePicker(options);
      return (options?.multiple ? handles : (handles[0] ?? null)) as OpenReturn<T>;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return null;
      throw e;
    }
  },

  /**
   * Opens a save file picker dialog.
   * Returns the selected handle, or `null` if the user cancelled.
   */
  async save<T extends ShowSaveFilePickerOptions>(options?: T) {
    try {
      return await showSaveFilePicker(options);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return null;
      throw e;
    }
  },
}));
