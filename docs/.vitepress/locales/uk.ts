import { LocaleConfig } from "vitepress";

import { html, licenses, socials } from "../shared/";

const download = {
  text: "Завантажити",
  link: "/uk/download",
};

const guide = {
  text: "Посібник",
  items: [
    {
      text: "Огляд",
      link: "/uk/guide/",
    },
    {
      text: "Параметри схем",
      link: "/uk/guide/pattern-options",
    },
    {
      text: "Палітра та символи",
      link: "/uk/guide/palette-and-symbols",
    },
    {
      text: "Робота зі схемами",
      link: "/uk/guide/working-with-patterns",
    },
    {
      text: "Імпортування зображень",
      link: "/uk/guide/importing-images",
    },
    {
      text: "Зразкові зображення",
      link: "/uk/guide/reference-images",
    },
    {
      text: "Публікація схем",
      link: "/uk/guide/publishing-patterns",
    },
  ],
};

const reference = {
  text: "Довідка",
  items: [
    {
      text: "Формати схеми",
      link: "/uk/reference/pattern-formats",
    },
    {
      text: "Сполучення клавіш",
      link: "/uk/reference/shortcuts",
    },
  ],
};

const resources = {
  text: "Ресурси",
  items: [
    {
      text: "Контакти",
      link: "/uk/resources/contacts",
    },
    {
      text: "Контрибʼютинг",
      link: "/uk/resources/contributing",
    },
    {
      text: "Змінопис",
      link: "/uk/resources/changelog",
    },
  ],
};

export const docsUk: LocaleConfig = {
  uk: {
    label: "Українська",
    lang: "uk-UA",
    title: "Embroiderly",
    description:
      "Безкоштовний, відкритий і кросплатформний компʼютерний застосунок для створення схем вишивок хрестиком.",
    themeConfig: {
      nav: [download, guide, reference, resources],
      sidebar: {
        "/uk/guide/": [guide],
        "/uk/reference/": [reference],
        "/uk/resources/": [resources],
      },
      outline: {
        level: [2, 6],
        label: "На цій сторінці",
      },
      docFooter: {
        prev: "Попередня сторінка",
        next: "Наступна сторінка",
      },
      lastUpdatedText: "Востаннє оновлено",
      sidebarMenuLabel: "Меню",
      returnToTopLabel: "До гори",
      skipToContentLabel: "Перейти до вмісту",
      langMenuLabel: "Змінити мову",
      darkModeSwitchLabel: "Вигляд",
      lightModeSwitchTitle: "Переключитися на світлу тему",
      darkModeSwitchTitle: "Переключитися на темну тему",
      socialLinks: [
        {
          ...socials.github,
          ariaLabel: "Посилання на початковий код Embroiderly на GitHub",
        },
        {
          ...socials.telegram,
          ariaLabel: "Посилання на спільноту Embroiderly у Telegram",
        },
        {
          ...socials.facebook,
          ariaLabel: "Посилання на спільноту Embroiderly у Facebook",
        },
      ],
      notFound: {
        code: "404",
        title: "СТОРІНКУ НЕ ЗНАЙДЕНО",
        linkText: "Повернутися на головну",
        linkLabel: "Повернутися на головну",
        quote: "", // Don't specify the quote.
      },
      footer: {
        message: `Цей вебсайт випущено під ліцензією ${html.link(licenses.docs.spdx, licenses.docs.link)}.
          </br>Embroiderly випущено під ліцензією ${html.link(licenses.app.spdx, licenses.app.link)}.`,
        copyright: `Авторське право © 2024-дотепер ${html.link("Назар Антонюк", "https://github.com/niusia-ua")} і контрибʼютори Embroiderly`,
      },
    },
  },
};

export const searchUk = {
  uk: {
    translations: {
      button: {
        buttonText: "Шукати",
        buttonAriaLabel: "Шукати",
      },
      modal: {
        backButtonTitle: "Закрити пошук",
        displayDetails: "Відображати детальний список",
        noResultsText: "Немає результатів для",
        resetButtonTitle: "Скинути пошук",
        footer: {
          navigateText: "щоб пересуватися",
          navigateUpKeyAriaLabel: "стрілка вгору",
          navigateDownKeyAriaLabel: "стрілка вниз",
          selectText: "щоб вибрати",
          selectKeyAriaLabel: "enter",
          closeText: "щоб закрити",
          closeKeyAriaLabel: "escape",
        },
      },
    },
  },
};
