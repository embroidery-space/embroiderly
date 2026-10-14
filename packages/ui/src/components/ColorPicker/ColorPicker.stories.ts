import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import ColorPicker from "./ColorPicker.vue";
import ColorPickerDemo from "./stories/ColorPickerDemo.vue";

const meta = {
  title: "Form/ColorPicker",
  component: ColorPicker,
} satisfies Meta<typeof ColorPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: { modelValue: "#FF0000" },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { ColorPickerDemo },
      setup: () => ({ args, updateArgs }),
      template: `<ColorPickerDemo v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />`,
    };
  },
};

export const Disabled: Story = {
  args: { modelValue: "#FF0000", disabled: true, "onUpdate:modelValue": fn() },
  render: (args) => ({
    components: { ColorPickerDemo },
    setup: () => ({ args }),
    template: `<ColorPickerDemo v-bind="args" />`,
  }),
  async play({ canvasElement, args }) {
    const selector = canvasElement.querySelector<HTMLElement>("[data-color-picker-selector]")!;
    const rect = selector.getBoundingClientRect();

    selector.dispatchEvent(
      new MouseEvent("mousedown", {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        bubbles: true,
      }),
    );
    window.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    await expect(args["onUpdate:modelValue"]).not.toHaveBeenCalled();
  },
};

export const SelectorDragged: Story = {
  args: { modelValue: "#FF0000", "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  render: Disabled.render,
  async play({ canvasElement, args }) {
    const selector = canvasElement.querySelector<HTMLElement>("[data-color-picker-selector]")!;
    const rect = selector.getBoundingClientRect();

    selector.dispatchEvent(
      new MouseEvent("mousedown", {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        bubbles: true,
      }),
    );
    window.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    await expect(args["onUpdate:modelValue"]).toHaveBeenCalled();
  },
};

export const TrackDragged: Story = {
  args: { modelValue: "#FF0000", "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  render: Disabled.render,
  async play({ canvasElement, args }) {
    const track = canvasElement.querySelector<HTMLElement>("[data-color-picker-track]")!;
    const rect = track.getBoundingClientRect();

    track.dispatchEvent(
      new MouseEvent("mousedown", {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        bubbles: true,
      }),
    );
    window.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    await expect(args["onUpdate:modelValue"]).toHaveBeenCalled();
  },
};
