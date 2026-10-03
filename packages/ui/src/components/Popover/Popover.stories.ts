import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import Popover from "./Popover.vue";
import PopoverDemo from "./stories/PopoverDemo.vue";
import PopoverOpen from "./stories/PopoverOpen.vue";
import PopoverOutsideClick from "./stories/PopoverOutsideClick.vue";

const sides = ["top", "right", "bottom", "left"] as const;
const aligns = ["start", "center", "end"] as const;

const meta = {
  title: "Overlay/Popover",
  component: Popover,
  argTypes: {
    side: { control: "select", options: sides },
    align: { control: "select", options: aligns },
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    side: "bottom",
    align: "center",
    modal: false,
  },
  render: (args) => ({
    components: { PopoverDemo },
    setup: () => ({ args }),
    template: `<PopoverDemo v-bind="args" />`,
  }),
};

export const Open: Story = {
  args: { ...Demo.args, open: true, portal: false },
  render: (args) => ({
    components: { PopoverOpen },
    setup: () => ({ args }),
    template: `<PopoverOpen v-bind="args" />`,
  }),
};

export const ClosesOnOutsideClick: Story = {
  args: { portal: false },
  tags: ["!autodocs", "!snapshot"],
  render: (args) => ({
    components: { PopoverOutsideClick },
    setup: () => ({ args }),
    template: `<PopoverOutsideClick v-bind="args" />`,
  }),
  async play({ canvas, userEvent }) {
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByText("Popover content")).toBeVisible();

    await userEvent.click(document.body);
    await expect(canvas.queryByText("Popover content")).not.toBeInTheDocument();
  },
};

export const PinnedStaysOpenOnOutsideClick: Story = {
  args: { portal: false, pinned: true },
  tags: ["!autodocs", "!snapshot"],
  render: ClosesOnOutsideClick.render,
  async play({ canvas, userEvent }) {
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByText("Popover content")).toBeVisible();

    await userEvent.click(document.body);
    await expect(canvas.getByText("Popover content")).toBeVisible();
  },
};
