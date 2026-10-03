import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, waitFor } from "storybook/test";

import Button from "./Button.vue";
import ButtonColorsAndVariants from "./stories/ButtonColorsAndVariants.vue";
import ButtonFieldGroup from "./stories/ButtonFieldGroup.vue";
import ButtonLinks from "./stories/ButtonLinks.vue";
import ButtonSquare from "./stories/ButtonSquare.vue";

const meta = {
  title: "Element/Button",
  component: Button,
  argTypes: {
    color: { control: "select", options: ["primary", "neutral"] },
    variant: { control: "select", options: ["solid", "outline", "soft", "subtle", "ghost", "link"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    leadingIcon: { control: "text" },
    trailingIcon: { control: "text" },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    label: "Button",

    color: "primary",
    variant: "solid",
    size: "md",

    loading: false,
    disabled: false,
    square: false,
  },
};

export const ColorsAndVariants: Story = {
  render: () => ({
    components: { ButtonColorsAndVariants },
    template: `<ButtonColorsAndVariants />`,
  }),
};

export const Square: Story = {
  render: () => ({
    components: { ButtonSquare },
    template: `<ButtonSquare />`,
  }),
};

export const Links: Story = {
  render: () => ({
    components: { ButtonLinks },
    template: `<ButtonLinks />`,
  }),
};

export const FieldGroup: Story = {
  render: () => ({
    components: { ButtonFieldGroup },
    template: `<ButtonFieldGroup />`,
  }),
};

export const AutoLoading: Story = {
  args: {
    label: "Submit",
    loadingAuto: true,
    // oxlint-disable-next-line no-promise-executor-return
    onClick: fn(() => new Promise<void>((resolve) => setTimeout(resolve, 300))),
  },
  tags: ["!snapshot"],
  async play({ canvas, userEvent, args }) {
    const button = canvas.getByRole("button");

    await userEvent.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(button).not.toBeDisabled());
  },
};
