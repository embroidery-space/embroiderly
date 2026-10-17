import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import Input from "./Input.vue";
import InputDemo from "./stories/InputDemo.vue";
import InputFieldGroup from "./stories/InputFieldGroup.vue";
import InputStates from "./stories/InputStates.vue";
import InputWithSlots from "./stories/InputWithSlots.vue";

const meta = {
  title: "Form/Input",
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: "Lorem ipsum",

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
