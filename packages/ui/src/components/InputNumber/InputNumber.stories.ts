import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import { renderWithLocalModel } from "~storybook-utils/render-with-local-model";

import InputNumber from "./InputNumber.vue";
import InputNumberDemo from "./stories/InputNumberDemo.vue";
import InputNumberFieldGroup from "./stories/InputNumberFieldGroup.vue";
import InputNumberSizes from "./stories/InputNumberSizes.vue";
import InputNumberStates from "./stories/InputNumberStates.vue";
import InputNumberVariants from "./stories/InputNumberVariants.vue";

const sizes = ["sm", "md", "lg"] as const;
const variants = ["subtle", "outline"] as const;

const meta = {
  title: "Form/InputNumber",
  component: InputNumber,
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: sizes },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
} satisfies Meta<typeof InputNumber>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: 5,

    variant: "subtle",
    size: "md",

    min: 0,
    max: 10,
    step: 1,

    increment: true,
    decrement: true,

    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { InputNumberDemo },
      setup: () => ({ args, updateArgs }),
      template: `<InputNumberDemo v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />`,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { InputNumberSizes },
    template: `<InputNumberSizes />`,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { InputNumberVariants },
    template: `<InputNumberVariants />`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { InputNumberStates },
    template: `<InputNumberStates />`,
  }),
};

export const FieldGroup: Story = {
  render: () => ({
    components: { InputNumberFieldGroup },
    template: `<InputNumberFieldGroup />`,
  }),
};

export const Filled: Story = {
  args: { "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  render: renderWithLocalModel(InputNumber, "InputNumber"),
  async play({ canvas, userEvent, args }) {
    const input = canvas.getByRole("spinbutton");

    await userEvent.clear(input);
    await userEvent.type(input, "42");
    await userEvent.keyboard("{Enter}");

    await expect(args["onUpdate:modelValue"]).toHaveBeenLastCalledWith(42);
  },
};

export const Incremented: Story = {
  args: { modelValue: 5, "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  render: renderWithLocalModel(InputNumber, "InputNumber"),
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("button", { name: "Increment" }));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(6);
  },
};

export const Decremented: Story = {
  args: { modelValue: 5, "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  render: renderWithLocalModel(InputNumber, "InputNumber"),
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("button", { name: "Decrement" }));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(4);
  },
};
