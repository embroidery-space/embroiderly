import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";

import Menubar from "./Menubar.vue";
import type { MenubarMenu, MenubarProps } from "./Menubar.vue";

describe("Menubar", () => {
  const sizes = ["sm", "md", "lg"] as const;

  const simpleMenus: MenubarMenu[] = [
    {
      label: "File",
      items: [
        [
          { label: "New", shortcut: "Ctrl+N" },
          { label: "Open", shortcut: "Ctrl+O" },
        ],
        [{ label: "Save", shortcut: "Ctrl+S" }],
      ],
    },
    {
      label: "Edit",
      items: [
        { icon: "lucide:scissors", label: "Cut" },
        { icon: "lucide:copy", label: "Copy" },
        { icon: "lucide:clipboard", label: "Paste", disabled: true },
      ],
    },
  ];

  const checkboxMenus: MenubarMenu[] = [
    {
      label: "View",
      items: [
        { type: "label", label: "Display" },
        { type: "separator" },
        { type: "checkbox", label: "Show Grid", checked: true },
        { type: "checkbox", label: "Show Rulers", checked: false },
      ],
    },
  ];

  const linkMenus: MenubarMenu[] = [
    {
      label: "Help",
      items: [
        { type: "link", label: "Internal Page", href: "/about" },
        { type: "link", label: "External Site", href: "https://example.com", target: "_blank" },
        { type: "link", label: "Disabled Link", href: "https://example.com", disabled: true },
      ],
    },
  ];

  const submenuMenus: MenubarMenu[] = [
    {
      label: "Tools",
      items: [
        {
          label: "More Tools",
          children: [{ label: "Spell Check" }, { label: "Word Count" }],
        },
      ],
    },
  ];

  const props: MenubarProps = { portal: false };

  test.each([
    ["with simple menus", { props: { ...props, menus: simpleMenus } }],
    ["with checkbox menus", { props: { ...props, menus: checkboxMenus } }],
    ["with submenu menus", { props: { ...props, menus: submenuMenus } }],
    ["with link menus", { props: { ...props, menus: linkMenus } }],
    [
      "with disabled menu",
      { props: { ...props, menus: [{ label: "File", disabled: true, items: [{ label: "New" }] }] } },
    ],
    ...sizes.map((size) => [`with size ${size}`, { props: { ...props, menus: simpleMenus, size } }]),
    ["with class", { props: { ...props, menus: simpleMenus, class: "min-w-48" } }],
    ["with ui", { props: { ...props, menus: simpleMenus, ui: { root: "bg-default", trigger: "font-bold" } } }],
  ] as [string, { props?: MenubarProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(Menubar as any, options);

    await userEvent.click(screen.getByRole("menuitem").first());

    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
