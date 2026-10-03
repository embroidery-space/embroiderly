import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import RadioGroup from "./RadioGroup.vue";
import RadioGroupDemo from "./stories/RadioGroupDemo.vue";
import RadioGroupHorizontal from "./stories/RadioGroupHorizontal.vue";
import RadioGroupSizes from "./stories/RadioGroupSizes.vue";
import RadioGroupStates from "./stories/RadioGroupStates.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/RadioGroup",
  // @ts-expect-error `RadioGroup` is a generic component.
  component: RadioGroup,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    size: "md",
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { RadioGroupDemo },
      setup: () => ({ args, updateArgs }),
      template: `<RadioGroupDemo v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />`,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { RadioGroupSizes },
    template: `<RadioGroupSizes />`,
  }),
};

export const Horizontal: Story = {
  render: () => ({
    components: { RadioGroupHorizontal },
    template: `<RadioGroupHorizontal />`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { RadioGroupStates },
    template: `<RadioGroupStates />`,
  }),
};

export const Selected: Story = {
  args: {
    items: ["Option 1", "Option 2"],
    "onUpdate:modelValue": fn(),
  },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getAllByRole("radio")[0]!);
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("Option 1");
  },
};
