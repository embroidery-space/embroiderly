import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Separator from "./Separator.vue";
import SeparatorDemo from "./stories/SeparatorDemo.vue";
import SeparatorSizes from "./stories/SeparatorSizes.vue";

const sizes = ["xs", "sm", "md", "lg", "xl"];

const meta = {
  title: "Element/Separator",
  component: Separator,
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    orientation: "vertical",
    size: "xs",
  },
  render: (args) => ({
    components: { SeparatorDemo },
    setup: () => ({ args }),
    template: `<SeparatorDemo v-bind="args" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { SeparatorSizes },
    template: `<SeparatorSizes />`,
  }),
};
