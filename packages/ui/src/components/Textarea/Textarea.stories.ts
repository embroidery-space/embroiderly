import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import TextareaDemo from "./stories/TextareaDemo.vue";
import TextareaSizes from "./stories/TextareaSizes.vue";
import TextareaStates from "./stories/TextareaStates.vue";
import TextareaVariants from "./stories/TextareaVariants.vue";
import Textarea from "./Textarea.vue";

const sizes = ["sm", "md", "lg"] as const;
const variants = ["subtle", "outline"] as const;

const meta = {
  title: "Form/Textarea",
  component: Textarea,
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: sizes },
    rows: { control: "number" },
    maxrows: { control: "number" },
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    variant: "subtle",
    size: "md",

    rows: 3,
    maxrows: 0,

    autoresize: false,
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { TextareaDemo },
      setup: () => ({ args, updateArgs }),
      template: `<TextareaDemo v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />`,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { TextareaSizes },
    template: `<TextareaSizes />`,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { TextareaVariants },
    template: `<TextareaVariants />`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TextareaStates },
    template: `<TextareaStates />`,
  }),
};

export const Filled: Story = {
  args: { "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.type(canvas.getByRole("textbox"), "Hello, World!");
    await expect(args["onUpdate:modelValue"]).toHaveBeenLastCalledWith("Hello, World!");
  },
};
