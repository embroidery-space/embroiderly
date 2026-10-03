import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect } from "storybook/test";

import InputDimensions from "./InputDimensions.vue";
import InputDimensionsDemo from "./stories/InputDimensionsDemo.vue";
import InputDimensionsSizes from "./stories/InputDimensionsSizes.vue";

const sizes = ["sm", "md", "lg"] as const;
const orientations = ["horizontal", "vertical"] as const;

const meta = {
  title: "Form/InputDimensions",
  component: InputDimensions,
  argTypes: {
    size: { control: "select", options: sizes },
    orientation: { control: "select", options: orientations },
    aspectRatio: { control: "number" },
  },
} satisfies Meta<typeof InputDimensions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    width: 800,
    height: 600,

    size: "md",
    orientation: "horizontal",
    aspectRatio: undefined,

    disabled: false,

    widthFieldOptions: { label: "Width" },
    heightFieldOptions: { label: "Height" },
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { InputDimensionsDemo },
      setup: () => ({ args, updateArgs }),
      template: `
        <InputDimensionsDemo
          v-bind="args"
          @update:width="(value) => updateArgs({ width: value })"
          @update:height="(value) => updateArgs({ height: value })"
        />
      `,
    };
  },
};

export const Sizes: Story = {
  args: { width: 800, height: 600 },
  render: (args) => ({
    components: { InputDimensionsSizes },
    setup: () => ({ args }),
    template: `<InputDimensionsSizes v-bind="args" />`,
  }),
};

export const AspectRatioLocked: Story = {
  args: { width: 100, height: 50, aspectRatio: 2 },
};

export const WidthChanged: Story = {
  args: { width: 100, height: 50 },
  tags: ["!autodocs", "!snapshot"],
  async play({ canvas, userEvent }) {
    const widthInput = canvas.getAllByRole("spinbutton")[0]!;
    const heightInput = canvas.getAllByRole("spinbutton")[1]!;

    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, "200");
    await userEvent.keyboard("{Enter}");

    await expect(widthInput).toHaveValue("200");
    // The lock is inactive without `aspectRatio`, so the height must stay untouched.
    await expect(heightInput).toHaveValue("50");
  },
};

export const AspectRatioLockToggled: Story = {
  args: { width: 100, height: 50 },
  tags: ["!autodocs", "!snapshot"],
  async play({ canvas, userEvent }) {
    const widthInput = canvas.getAllByRole("spinbutton")[0]!;
    const heightInput = canvas.getAllByRole("spinbutton")[1]!;

    const lockButton = canvas.getByRole("button", { name: "Lock aspect ratio" });
    await expect(lockButton).toHaveAttribute("aria-pressed", "false");

    // Before locking, editing the width must not touch the height.
    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, "150");
    await userEvent.keyboard("{Enter}");

    await expect(widthInput).toHaveValue("150");
    await expect(heightInput).toHaveValue("50");

    await userEvent.click(lockButton);

    const unlockButton = canvas.getByRole("button", { name: "Unlock aspect ratio" });
    await expect(unlockButton).toHaveAttribute("aria-pressed", "true");

    // Locking stores the current 150/50 ratio, so after toggling, editing the width now drives the height.
    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, "300");
    await userEvent.keyboard("{Enter}");

    await expect(widthInput).toHaveValue("300");
    await expect(heightInput).toHaveValue("100");
  },
};
