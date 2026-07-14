import type { Meta, StoryObj } from "@storybook/vue3-vite";

import ButtonIcon from "./ButtonIcon.vue";

const meta = {
  title: "Element/ButtonIcon",
  component: ButtonIcon,
  argTypes: {
    color: { control: "select", options: ["primary", "neutral"] },
    variant: { control: "select", options: ["solid", "outline", "soft", "subtle", "ghost", "link"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    icon: { control: "text" },
  },
} satisfies Meta<typeof ButtonIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    color: "neutral",
    variant: "ghost",

    icon: "lucide:settings",

    tooltip: "Settings",
    shortcut: "Ctrl+,",
    delayDuration: 200,
  },
};
