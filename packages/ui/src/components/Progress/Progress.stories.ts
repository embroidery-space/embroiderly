import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Progress from "./Progress.vue";
import ProgressColors from "./stories/ProgressColors.vue";
import ProgressDemo from "./stories/ProgressDemo.vue";
import ProgressSizes from "./stories/ProgressSizes.vue";

const colors = ["primary", "error", "warning", "success", "info", "help", "neutral"];
const sizes = ["xs", "sm", "md", "lg", "xl"];

const meta = {
  title: "Element/Progress",
  component: Progress,
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    color: { control: "select", options: colors },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    orientation: "horizontal",
    color: "primary",
    size: "md",
  },
  render: (args) => ({
    components: { ProgressDemo },
    setup: () => ({ args }),
    template: `<ProgressDemo v-bind="args" />`,
  }),
};

export const Colors: Story = {
  render: () => ({
    components: { ProgressColors },
    template: `<ProgressColors />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { ProgressSizes },
    template: `<ProgressSizes />`,
  }),
};
