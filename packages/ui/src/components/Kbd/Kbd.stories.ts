import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Kbd from "./Kbd.vue";
import KbdDemo from "./stories/KbdDemo.vue";
import KbdSizes from "./stories/KbdSizes.vue";

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
    components: { KbdDemo },
    setup: () => ({ args }),
    template: `<KbdDemo v-bind="args" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { KbdSizes },
    template: `<KbdSizes />`,
  }),
};
