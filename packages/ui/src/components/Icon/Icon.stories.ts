import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Icon from "./Icon.vue";
import IconSizes from "./stories/IconSizes.vue";

const meta = {
  title: "Element/Icon",
  component: Icon,
  argTypes: {
    name: { control: "text" },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    name: "lucide:lightbulb",
  },
};

export const Sizes: Story = {
  args: { name: "lucide:rocket" },
  render: () => ({
    components: { IconSizes },
    template: `<IconSizes />`,
  }),
};
