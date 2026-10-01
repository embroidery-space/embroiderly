import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import SwitchDemo from "./stories/SwitchDemo.vue";
import SwitchSizes from "./stories/SwitchSizes.vue";
import SwitchStates from "./stories/SwitchStates.vue";
import Switch from "./Switch.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/Switch",
  component: Switch,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    label: "Switch",
    description: "Description",

    size: "md",
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { SwitchDemo },
      setup: () => ({ args, updateArgs }),
      template: `<SwitchDemo v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />`,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { SwitchSizes },
    template: `<SwitchSizes />`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { SwitchStates },
    template: `<SwitchStates />`,
  }),
};

export const Checked: Story = {
  args: {
    label: "Switch",
    "onUpdate:modelValue": fn(),
  },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("switch"));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(true);
  },
};
