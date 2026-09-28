import type { Meta, StoryObj } from "@storybook/vue3-vite";

import ToastColors from "./stories/ToastColors.vue";
import ToastDemo from "./stories/ToastDemo.vue";
import ToastDynamic from "./stories/ToastDynamic.vue";
import Toast from "./Toast.vue";

const colors = ["primary", "error", "warning", "success", "info", "help", "neutral"] as const;

const meta = {
  title: "Overlay/Toast",
  component: Toast,
  argTypes: {
    color: { control: "select", options: colors },
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    title: "Toast Title",
    description: "This is a description of the toast.",

    color: "primary",
    open: true,
  },
  render: (args) => ({
    components: { ToastDemo },
    setup: () => ({ args }),
    template: `<ToastDemo v-bind="args" />`,
  }),
};

export const Colors: Story = {
  args: { title: "Toast" },
  render: () => ({
    components: { ToastColors },
    template: `<ToastColors />`,
  }),
};

export const Dynamic: Story = {
  args: { title: "Dynamic Toast" },
  tags: ["!snapshot"],
  render: () => ({
    components: { ToastDynamic },
    template: `<ToastDynamic />`,
  }),
};
