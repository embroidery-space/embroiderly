import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import ConfirmDialog from "./ConfirmDialog.vue";
import ConfirmDialogDemo from "./stories/ConfirmDialogDemo.vue";
import ConfirmDialogOpen from "./stories/ConfirmDialogOpen.vue";

const meta = {
  title: "Overlay/ConfirmDialog",
  component: ConfirmDialog,
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    title: "Save changes",
    description: "Do you want to save your changes before closing?",
  },
  render: (args) => ({
    components: { ConfirmDialogDemo },
    setup: () => ({ args }),
    template: `<ConfirmDialogDemo v-bind="args" />`,
  }),
};

export const Open: Story = {
  args: { ...Demo.args, open: true, portal: false },
  tags: ["!autodocs"],
  render: (args) => ({
    components: { ConfirmDialogOpen },
    setup: () => ({ args }),
    template: `<ConfirmDialogOpen v-bind="args" />`,
  }),
  async play({ canvas, args }) {
    await expect(canvas.getByText(args.title!)).toBeVisible();
  },
};
