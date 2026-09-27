import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import TooltipDemo from "./stories/TooltipDemo.vue";
import Tooltip from "./Tooltip.vue";

const sides = ["top", "right", "bottom", "left"] as const;
const aligns = ["start", "center", "end"] as const;

const meta = {
  title: "Overlay/Tooltip",
  component: Tooltip,
  argTypes: {
    text: { control: "text" },
    shortcut: { control: "text" },
    side: { control: "select", options: sides },
    align: { control: "select", options: aligns },
    delayDuration: { control: "number" },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    text: "Lorem ipsum",
    shortcut: "Ctrl+B",

    side: "bottom",
    align: "center",

    delayDuration: 200,

    disabled: false,
  },
  render: (args) => ({
    components: { TooltipDemo },
    setup: () => ({ args }),
    template: `<TooltipDemo v-bind="args" />`,
  }),
};

export const Open: Story = {
  args: { ...Demo.args, open: true, portal: false },
  render: Demo.render,
  async play({ canvas }) {
    await expect(canvas.getByText("Lorem ipsum")).toBeVisible();
  },
};
