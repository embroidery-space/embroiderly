import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import { renderWithLocalModel } from "~storybook-utils/render-with-local-model";

import Slider from "./Slider.vue";
import SliderChanged from "./stories/SliderChanged.vue";
import SliderDemo from "./stories/SliderDemo.vue";
import SliderSizes from "./stories/SliderSizes.vue";
import SliderStates from "./stories/SliderStates.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/Slider",
  component: Slider,
  argTypes: {
    size: { control: "select", options: sizes },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: 50,

    min: 0,
    max: 100,
    step: 1,

    size: "md",
    tooltip: false,
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { SliderDemo },
      setup: () => ({ args, updateArgs }),
      template: `<SliderDemo v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />`,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { SliderSizes },
    template: `<SliderSizes />`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { SliderStates },
    template: `<SliderStates />`,
  }),
};

export const Changed: Story = {
  args: {
    modelValue: 50,
    "onUpdate:modelValue": fn(),
  },
  tags: ["!autodocs"],
  render: renderWithLocalModel(SliderChanged, "SliderChanged"),
  async play({ canvas, userEvent, args }) {
    canvas.getByRole("slider").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(51);
  },
};
