import type { Locale } from "../types/locale.ts";

export default Object.freeze<Locale>({
  name: "Українська",
  code: "uk",
  dir: "ltr",
  messages: {
    inputNumber: {
      increment: "Збільшити",
      decrement: "Зменшити",
    },
    select: {
      search: "Пошук…",
      noData: "Немає даних",
      noMatches: "Збігів не знайдено",
    },
  },
});
