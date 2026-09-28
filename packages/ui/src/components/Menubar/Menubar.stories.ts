import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn } from "storybook/test";

import Menubar from "./Menubar.vue";
import type { MenubarMenu } from "./Menubar.vue";
import MenubarDemo from "./stories/MenubarDemo.vue";
import MenubarOpen from "./stories/MenubarOpen.vue";

const sizes = ["sm", "md", "lg"] as const;

const demoMenus: MenubarMenu[] = [
  {
    label: "File",
    items: [
      [
        { label: "New", shortcut: "Ctrl+N" },
        { label: "Open", shortcut: "Ctrl+O" },
      ],
      [
        { label: "Save", shortcut: "Ctrl+S" },
        { label: "Save As", shortcut: "Ctrl+Shift+S" },
      ],
      [{ label: "Exit" }],
    ],
  },
  {
    label: "Edit",
    items: [
      [
        { label: "Undo", shortcut: "Ctrl+Z" },
        { label: "Redo", shortcut: "Ctrl+Shift+Z" },
      ],
      [
        { icon: "lucide:scissors", label: "Cut", shortcut: "Ctrl+X" },
        { icon: "lucide:copy", label: "Copy", shortcut: "Ctrl+C" },
        { icon: "lucide:clipboard", label: "Paste", shortcut: "Ctrl+V" },
      ],
    ],
  },
  {
    label: "View",
    items: [
      { type: "label", label: "Display" },
      { type: "separator" },
      { type: "checkbox", label: "Show Grid", checked: true },
      { type: "checkbox", label: "Show Rulers", checked: false },
    ],
  },
  {
    label: "Help",
    items: [
      {
        label: "Documentation",
        children: [{ label: "Getting Started" }, { label: "API Reference" }],
      },
      { type: "separator" },
      { label: "About" },
      { type: "separator" },
      { type: "link", label: "Internal Page", href: "/about" },
      { type: "link", label: "External Site", href: "https://example.com", target: "_blank" },
      { type: "link", label: "Disabled Link", href: "https://example.com", disabled: true },
    ],
  },
];

const meta = {
  title: "Navigation/Menubar",
  // @ts-expect-error `Menubar` is a generic component.
  component: Menubar,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Menubar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    size: "md",
  },
  render: (args) => ({
    components: { MenubarDemo },
    setup: () => ({ args, menus: demoMenus }),
    template: `<MenubarDemo v-bind="args" :menus="menus" />`,
  }),
};

export const Open: Story = {
  args: {
    ...Demo.args,
    defaultValue: "File",
    portal: false, // `portal` must be disabled here so the opened content stays inside the captured snapshot subject.
  },
  render: (args) => ({
    components: { MenubarOpen },
    setup: () => ({ args, menus: demoMenus }),
    template: `<MenubarOpen v-bind="args" :menus="menus" />`,
  }),
  async play({ canvas }) {
    await expect(canvas.getByRole("menuitem", { name: /New/u })).toBeVisible();
  },
};

export const DisabledMenu: Story = {
  args: { size: "md", portal: false },
  render: (args) => ({
    components: { MenubarDemo },
    // oxlint-disable-next-line oxc/no-map-spread
    setup: () => ({ args, menus: demoMenus.map((menu) => ({ ...menu, disabled: true })) }),
    template: `<MenubarDemo v-bind="args" :menus="menus" />`,
  }),
};

export const ShortcutTriggered: Story = {
  args: { onSelect: fn() },
  tags: ["!autodocs", "!snapshot"],
  render: (args) => {
    const menus: MenubarMenu[] = [
      {
        label: "Edit",
        items: [{ label: "Undo", shortcut: "Control+Z", onSelect: args.onSelect as (event: Event) => void }],
      },
    ];
    return {
      components: { MenubarDemo },
      setup: () => ({ menus }),
      template: `<MenubarDemo :menus="menus" :portal="false" />`,
    };
  },
  async play({ userEvent, args }) {
    await userEvent.keyboard("{Control>}z{/Control}");
    await expect(args.onSelect).toHaveBeenCalled();
  },
};
