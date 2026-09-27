import type { Meta, StoryObj } from "@storybook/vue3-vite";

import BlockUI from "./BlockUI.vue";
import BlockUIDemo from "./stories/BlockUIDemo.vue";

const meta = {
  title: "Overlay/BlockUI",
  component: BlockUI,
} satisfies Meta<typeof BlockUI>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    blocked: false,
  },
  render: (args) => ({
    components: { BlockUIDemo },
    setup: () => ({ args }),
    template: `<BlockUIDemo v-bind="args" />`,
  }),
};

export const Blocked: Story = {
  args: { ...Demo.args, blocked: true },
  render: Demo.render,
};
