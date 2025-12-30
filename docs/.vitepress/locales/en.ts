import { LocaleConfig } from "vitepress";

import { html, licenses, socials } from "../shared/";

const download = {
  text: "Download",
  link: "/en/download",
};

const guide = {
  text: "Guide",
  items: [
    {
      text: "Overview",
      link: "/en/guide/overview",
    },
    {
      text: "Getting Started",
      link: "/en/guide/getting-started",
    },
    {
      text: "Pattern Options",
      link: "/en/guide/pattern-options",
    },
    {
      text: "Palette & Symbols",
      link: "/en/guide/palette-and-symbols",
    },
    {
      text: "Working with Patterns",
      link: "/en/guide/working-with-patterns",
    },
    {
      text: "Working with Images",
      link: "/en/guide/working-with-images",
    },
    {
      text: "Publishing Patterns",
      link: "/en/guide/publishing-patterns",
    },
  ],
};

export const docsEn: LocaleConfig = {
  en: {
    label: "English",
    lang: "en-US",
    title: "Embroiderly",
    description: "A free, open-source, cross-platform desktop application for designing cross-stitch patterns.",
    themeConfig: {
      nav: [download, guide],
      sidebar: {
        "/en/guide/": [guide],
      },
      outline: {
        level: [2, 6],
        label: "On this page",
      },
      docFooter: {
        prev: "Previous page",
        next: "Next page",
      },
      lastUpdatedText: "Last updated",
      sidebarMenuLabel: "Menu",
      returnToTopLabel: "Return to top",
      langMenuLabel: "Change language",
      darkModeSwitchLabel: "Appearance",
      lightModeSwitchTitle: "Switch to light theme",
      darkModeSwitchTitle: "Switch to dark theme",
      socialLinks: [
        {
          ...socials.github,
          ariaLabel: "Link to the Embroiderly repository on GitHub",
        },
        {
          ...socials.telegram,
          ariaLabel: "Link to the Embroiderly community group in Telegram",
        },
      ],
      notFound: {
        code: "404",
        title: "PAGE NOT FOUND",
        linkText: "Go to home",
        linkLabel: "Go to home",
        quote: "", // Don't specify the quote.
      },
      footer: {
        message: `This website is released under the ${html.link(licenses.docs.spdx, licenses.docs.link)} license.
          </br>Embroiderly is released under the ${html.link(licenses.app.spdx, licenses.app.link)} license.`,
        copyright: `Copyright © 2024-present ${html.link("Nazar Antoniuk", "https://github.com/niusia-ua")} and Embroiderly contributors`,
      },
    },
  },
};

export const searchEn = {
  en: {
    translations: {
      button: {
        buttonText: "Search",
        buttonAriaLabel: "Search",
      },
      modal: {
        backButtonTitle: "Close search",
        displayDetails: "Display detailed list",
        noResultsText: "No results for",
        resetButtonTitle: "Reset search",
        footer: {
          navigateText: "to navigate",
          navigateUpKeyAriaLabel: "arrow up",
          navigateDownKeyAriaLabel: "arrow down",
          selectText: "to select",
          selectKeyAriaLabel: "enter",
          closeText: "to close",
          closeKeyAriaLabel: "escape",
        },
      },
    },
  },
};
