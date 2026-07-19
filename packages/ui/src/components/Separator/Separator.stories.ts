import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Separator from "./Separator.vue";

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
    components: { Separator },
    setup: () => ({ args }),
    template: `
      <div class="size-96">
        <Separator v-bind="args" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Separator },
    setup: () => ({ sizes }),
    template: `
      <div class="flex w-96 flex-col gap-4">
        <Separator v-for="size in sizes" :key="size" :size="size" />
      </div>
    `,
  }),
};
