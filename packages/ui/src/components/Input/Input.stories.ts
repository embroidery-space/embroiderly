import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import Input from "./Input.vue";
import InputDemo from "./stories/InputDemo.vue";
import InputFieldGroup from "./stories/InputFieldGroup.vue";
import InputSizes from "./stories/InputSizes.vue";
import InputStates from "./stories/InputStates.vue";
import InputVariants from "./stories/InputVariants.vue";
import InputWithSlots from "./stories/InputWithSlots.vue";

const sizes = ["sm", "md", "lg"] as const;
const variants = ["subtle", "outline", "none"] as const;

const meta = {
  title: "Form/Input",
  component: Input,
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: sizes },
    leadingIcon: { control: "text" },
    trailingIcon: { control: "text" },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: "Lorem ipsum",

    variant: "subtle",
    size: "md",

    leadingIcon: "",
    trailingIcon: "",
    loading: false,
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { InputDemo },
      setup: () => ({ args, updateArgs }),
      template: `<InputDemo v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />`,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { InputSizes },
    template: `<InputSizes />`,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { InputVariants },
    template: `<InputVariants />`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { InputStates },
    template: `<InputStates />`,
  }),
};

export const WithSlots: Story = {
  render: () => ({
    components: { InputWithSlots },
    template: `<InputWithSlots />`,
  }),
};

export const FieldGroup: Story = {
  render: () => ({
    components: { InputFieldGroup },
    template: `<InputFieldGroup />`,
  }),
};

export const Filled: Story = {
  args: { "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.type(canvas.getByRole("textbox"), "qwerty");
    await expect(args["onUpdate:modelValue"]).toHaveBeenLastCalledWith("qwerty");
  },
};
