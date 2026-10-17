import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import Checkbox from "./Checkbox.vue";
import CheckboxDemo from "./stories/CheckboxDemo.vue";
import CheckboxStates from "./stories/CheckboxStates.vue";

const meta = {
  title: "Form/Checkbox",
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    label: "Checkbox",
    description: "Description",
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { CheckboxDemo },
      setup: () => ({ args, updateArgs }),
      template: `<CheckboxDemo v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />`,
    };
  },
};

export const States: Story = {
  render: () => ({
    components: { CheckboxStates },
    template: `<CheckboxStates />`,
  }),
};

export const Checked: Story = {
  args: { label: "Checkbox", "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("checkbox"));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(true);
  },
};
