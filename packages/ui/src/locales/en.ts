import type { Locale } from "../types/locale.ts";

export default Object.freeze<Locale>({
  name: "English",
  code: "en",
  dir: "ltr",
  messages: {
    confirmDialog: {
      cancel: "Cancel",
      no: "No",
      yes: "Yes",
    },
    dialog: {
      close: "Close",
    },
    filePicker: {
      chooseFile: "Choose file",
    },
    inputDimensions: {
      lockAspectRatio: "Lock aspect ratio",
      unlockAspectRatio: "Unlock aspect ratio",
    },
    inputNumber: {
      increment: "Increment",
      decrement: "Decrement",
    },
    listbox: {
      search: "Search…",
      empty: "No items",
    },
    select: {
      search: "Search…",
      noData: "No data",
      noMatches: "No matches",
    },
    slider: {
      thumb: "Thumb",
    },
    toast: {
      close: "Close",
      focus: "Notifications ({hotkey})",
      notification: "Notification",
    },
  },
});
