import type { Locale } from "../types/locale.ts";

export default Object.freeze<Locale>({
  name: "English",
  code: "en",
  dir: "ltr",
  messages: {
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
  },
});
