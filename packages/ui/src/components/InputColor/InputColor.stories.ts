import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import { renderWithLocalModel } from "~storybook-utils/render-with-local-model";

import InputColor from "./InputColor.vue";
import InputColorDemo from "./stories/InputColorDemo.vue";
import InputColorSizes from "./stories/InputColorSizes.vue";
import InputColorStates from "./stories/InputColorStates.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/InputColor",
  component: InputColor,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof InputColor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: "FF0000",
    size: "md",
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { InputColorDemo },
      setup: () => ({ args, updateArgs }),
      template: `<InputColorDemo v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />`,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { InputColorSizes },
    template: `<InputColorSizes />`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { InputColorStates },
    template: `<InputColorStates />`,
  }),
};

export const Updated: Story = {
  args: { modelValue: "FF0000", "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  render: renderWithLocalModel(InputColor, "InputColor"),
  async play({ canvas, userEvent, args }) {
    const input = canvas.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "#00FF00");
    await expect(args["onUpdate:modelValue"]).toHaveBeenLastCalledWith("00FF00");
  },
};
