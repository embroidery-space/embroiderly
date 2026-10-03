import type { Meta, StoryObj } from "@storybook/vue3-vite";

import DesignTokensDemo from "./stories/DesignTokensDemo.vue";

const meta = {
  title: "General/Design Tokens",
} satisfies Meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  render: () => ({
    components: { DesignTokensDemo },
    template: `<DesignTokensDemo />`,
  }),
};

export default meta;
