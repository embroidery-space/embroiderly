import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Icon from "./Icon.vue";
import IconSizes from "./stories/IconSizes.vue";

const meta = {
  title: "Element/Icon",
  component: Icon,
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    name: "rocket",
  },
};

export const Sizes: Story = {
  args: { name: "palette" },
  render: () => ({
    components: { IconSizes },
    template: `<IconSizes />`,
  }),
};
