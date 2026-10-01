import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import Dialog from "./Dialog.vue";
import DialogDemo from "./stories/DialogDemo.vue";
import DialogOpen from "./stories/DialogOpen.vue";

const meta = {
  title: "Overlay/Dialog",
  component: Dialog,
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    title: "Dialog Title",
    description: "This is a description of the dialog.",
  },
  render: (args) => ({
    components: { DialogDemo },
    setup: () => ({ args }),
    template: `<DialogDemo v-bind="args" />`,
  }),
};

export const Open: Story = {
  args: { ...Demo.args, open: true, portal: false },
  tags: ["!autodocs"],
  render: (args) => ({
    components: { DialogOpen },
    setup: () => ({ args }),
    template: `<DialogOpen v-bind="args" />`,
  }),
  async play({ canvas, args }) {
    await expect(canvas.getByText(args.title!)).toBeVisible();
  },
};
