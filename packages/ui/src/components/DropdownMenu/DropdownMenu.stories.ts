import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn } from "storybook/test";
import { computed, ref } from "vue";

import DropdownMenu from "./DropdownMenu.vue";
import type { DropdownMenuItem } from "./DropdownMenu.vue";
import DropdownMenuDemo from "./stories/DropdownMenuDemo.vue";
import DropdownMenuOpen from "./stories/DropdownMenuOpen.vue";

const sizes = ["sm", "md", "lg"] as const;

function demoItems(showGrid: { value: boolean }, showRulers: { value: boolean }): DropdownMenuItem[][] {
  return [
    [
      { icon: "lucide:scissors", label: "Cut", shortcut: "Ctrl+X" },
      { icon: "lucide:copy", label: "Copy", shortcut: "Ctrl+C" },
      { icon: "lucide:clipboard", label: "Paste", shortcut: "Ctrl+V", disabled: true },
    ],
    [
      { type: "label", label: "View" },
      { type: "separator" },
      {
        type: "checkbox",
        label: "Show Grid",
        checked: showGrid.value,
        onUpdateChecked(checked: boolean) {
          showGrid.value = checked;
        },
        onSelect(e: Event) {
          e.preventDefault();
        },
      },
      {
        type: "checkbox",
        label: "Show Rulers",
        checked: showRulers.value,
        onUpdateChecked(checked: boolean) {
          showRulers.value = checked;
        },
        onSelect(e: Event) {
          e.preventDefault();
        },
      },
    ],
    [
      {
        label: "More Tools",
        children: [
          [
            { label: "Undo", shortcut: "Ctrl+Z" },
            { label: "Redo", shortcut: "Ctrl+Shift+Z" },
          ],
          [{ label: "Select All", shortcut: "Ctrl+A" }],
        ],
      },
    ],
    [
      { type: "link", label: "Internal Page", href: "/about" },
      { type: "link", label: "External Site", href: "https://example.com", target: "_blank" },
      { type: "link", label: "Disabled Link", href: "https://example.com", disabled: true },
    ],
  ];
}

const meta = {
  title: "Overlay/DropdownMenu",
  // @ts-expect-error `DropdownMenu` is a generic component.
  component: DropdownMenu,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    size: "md",
    disabled: false,
  },
  render: (args) => {
    const showGrid = ref(true);
    const showRulers = ref(false);
    const items = computed(() => demoItems(showGrid, showRulers));
    return {
      components: { DropdownMenuDemo },
      setup: () => ({ args, items }),
      template: `<DropdownMenuDemo v-bind="args" :items="items" />`,
    };
  },
};

export const Open: Story = {
  args: { ...Demo.args, open: true, portal: false },
  render: (args) => {
    const showGrid = ref(true);
    const showRulers = ref(false);
    const items = computed(() => demoItems(showGrid, showRulers));
    return {
      components: { DropdownMenuOpen },
      setup: () => ({ args, items }),
      template: `<DropdownMenuOpen v-bind="args" :items="items" />`,
    };
  },
  async play({ canvas }) {
    await expect(canvas.getByRole("menuitem", { name: /Cut/u })).toBeVisible();
  },
};

export const ShortcutTriggered: Story = {
  args: { onSelect: fn() },
  tags: ["!autodocs", "!snapshot"],
  render: (args) => {
    const items: DropdownMenuItem[][] = [
      [
        { label: "Undo", shortcut: "Control+Z", onSelect: args.onSelect as (event: Event) => void },
        { label: "Go to Definition", shortcut: "G-D", onSelect: args.onSelect as (event: Event) => void },
        { label: "No Shortcut" },
        {
          label: "Edit",
          children: [{ label: "Redo", shortcut: "Control+Shift+Z", onSelect: args.onSelect as (event: Event) => void }],
        },
      ],
    ];
    return {
      components: { DropdownMenuDemo },
      setup: () => ({ args, items }),
      template: `<DropdownMenuDemo v-bind="args" :items="items" :portal="false" />`,
    };
  },
  async play({ userEvent, args }) {
    await userEvent.keyboard("{Control>}z{/Control}");
    await expect(args.onSelect).toHaveBeenCalledTimes(1);

    await userEvent.keyboard("gd");
    await expect(args.onSelect).toHaveBeenCalledTimes(2);

    await userEvent.keyboard("{Control>}{Shift>}z{/Shift}{/Control}");
    await expect(args.onSelect).toHaveBeenCalledTimes(3);

    await userEvent.keyboard("x");
    await expect(args.onSelect).toHaveBeenCalledTimes(3);
  },
};
