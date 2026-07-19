import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Progress from "./Progress.vue";

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
    components: { Progress },
    setup: () => ({ args }),
    template: `
      <div :class="args.orientation === 'horizontal' ? 'w-96 flex-col' : 'h-48 flex-row'">
        <Progress v-bind="args" />
      </div>
    `,
  }),
};

export const Colors: Story = {
  render: () => ({
    components: { Progress },
    setup: () => ({ colors }),
    template: `
      <div class="flex w-96 flex-col gap-4">
        <Progress v-for="color in colors" :key="color" :color="color" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Progress },
    setup: () => ({ sizes }),
    template: `
      <div class="flex w-96 flex-col gap-4">
        <Progress v-for="size in sizes" :key="size" :size="size" />
      </div>
    `,
  }),
};
