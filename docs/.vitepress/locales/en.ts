import type { LocaleConfig } from "vitepress";

import { socials } from "../shared/";

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
        "/en/guide/": [{ collapsed: false, ...guide }],
      },
      outline: {
        level: [1, 6],
        label: "On this page",
      },
      docFooter: {
        prev: "Previous page",
        next: "Next page",
      },
      lastUpdatedText: "Last updated",
      darkModeSwitchLabel: "Appearance", // Only displayed in the mobile view.
      sidebarMenuLabel: "Menu", // Only displayed in the mobile view.
      returnToTopLabel: "Return to top", // Only displayed in the mobile view.
      langMenuLabel: "Change language", // Aria-label.
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
        linkLabel: "Go to home", // Aria-label.
        quote: "", // Don't specify the quote.
      },
      footer: {
        message: `This website is released under the <a href="https://github.com/embroidery-space/embroiderly/blob/main/docs/LICENSE">CC-BY-SA-4.0 License</a>.
          </br>Embroiderly is released under the <a href="https://github.com/embroidery-space/embroiderly/blob/main/LICENSE">GPL-3.0-or-later License</a>.`,
        copyright: `Copyright © 2024-present <a href="https://github.com/niusia-ua">Nazar Antoniuk</a> and Embroiderly contributors`,
      },
    },
  },
};
