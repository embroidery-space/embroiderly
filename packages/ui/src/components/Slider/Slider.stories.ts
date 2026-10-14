import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import { renderWithLocalModel } from "~storybook-utils/render-with-local-model";

import Slider from "./Slider.vue";
import SliderChanged from "./stories/SliderChanged.vue";
import SliderDemo from "./stories/SliderDemo.vue";
import SliderStates from "./stories/SliderStates.vue";

const meta = {
  title: "Form/Slider",
  component: Slider,
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: 50,

    min: 0,
    max: 100,
    step: 1,

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
