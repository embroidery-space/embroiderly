import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { parseShortcutDisplay } from "../../utils/shortcut.ts";

import Kbd from "./Kbd.vue";

const meta = {
  title: "Element/Kbd",
  component: Kbd,
  argTypes: {
    value: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Kbd>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    value: "Shift+V-M",
    size: "md",
  },
  render: (args) => ({
    components: { Kbd },
    setup: () => ({ args, parseShortcutDisplay }),
    template: `
      <div class="flex items-center gap-1">
        <Kbd v-for="(key, i) in parseShortcutDisplay(args.value)" :key="i" v-bind="args" :value="key" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Kbd },
    setup: () => ({ sizes: ["sm", "md", "lg"] }),
    template: `
      <div class="flex items-center gap-1">
        <Kbd v-for="size in sizes" :key="size" :value="size.toUpperCase()" :size="size" />
      </div>
    `,
  }),
};
