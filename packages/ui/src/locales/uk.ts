import type { Locale } from "../types/locale.ts";

export default Object.freeze<Locale>({
  name: "Українська",
  code: "uk",
  dir: "ltr",
  messages: {
    confirmDialog: {
      cancel: "Скасувати",
      no: "Ні",
      yes: "Так",
    },
    dialog: {
      close: "Закрити",
    },
    filePicker: {
      chooseFile: "Вибрати файл",
    },
    inputNumber: {
      increment: "Збільшити",
      decrement: "Зменшити",
    },
    select: {
      search: "Пошук…",
      noData: "Немає даних",
      noMatches: "Збігів не знайдено",
    },
    slider: {
      thumb: "Повзунок",
    },
    toast: {
      close: "Закрити",
    },
  },
});
