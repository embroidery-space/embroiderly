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
    inputNumber: {
      increment: "Increment",
      decrement: "Decrement",
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
