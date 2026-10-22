import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";

import Pagination from "./Pagination.vue";

const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    page: 1,
    total: 10,
    itemsPerPage: 1,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { Pagination },
      setup: () => ({ args, updateArgs }),
      template: `<Pagination v-bind="args" @update:page="(page) => updateArgs({ page })" />`,
    };
  },
};

export const WithEdges: Story = {
  args: {
    page: 1,
    total: 100,
    itemsPerPage: 10,
    showEdges: true,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { Pagination },
      setup: () => ({ args, updateArgs }),
      template: `<Pagination v-bind="args" @update:page="(page) => updateArgs({ page })" />`,
    };
  },
};
