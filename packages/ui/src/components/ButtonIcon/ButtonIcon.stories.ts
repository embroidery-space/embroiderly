import type { Meta, StoryObj } from "@storybook/vue3-vite";

import ButtonIcon from "./ButtonIcon.vue";

const meta = {
  title: "Element/ButtonIcon",
  component: ButtonIcon,
} satisfies Meta<typeof ButtonIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    color: "neutral",
    variant: "ghost",

    icon: "settings",

    tooltip: "Settings",
    shortcut: "Ctrl+,",
    delayDuration: 200,
  },
};
