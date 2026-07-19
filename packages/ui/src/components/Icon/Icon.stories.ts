import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Icon from "./Icon.vue";

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
    components: { Icon },
    template: `
      <div class="flex items-end gap-4">
        <Icon name="lucide:rocket" class="size-4" />
        <Icon name="lucide:rocket" class="size-6" />
        <Icon name="lucide:rocket" class="size-8" />
        <Icon name="lucide:rocket" class="size-12" />
        <Icon name="lucide:rocket" class="size-16" />
      </div>
    `,
  }),
};
