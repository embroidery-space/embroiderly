import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, waitFor } from "storybook/test";

import FormFieldGroup from "../FormFieldGroup/FormFieldGroup.vue";

import Button from "./Button.vue";

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
    components: { Button },
    setup: () => ({
      colors: ["primary", "neutral"],
      variants: ["solid", "outline", "soft", "subtle", "ghost", "link"],
    }),
    template: `
      <div class="grid grid-cols-6 grid-rows-2 gap-2">
        <template v-for="color in colors" :key="color">
          <template v-for="variant in variants" :key="variant">
            <Button :variant="variant" :color="color">{{ variant }} {{ color }}</Button>
          </template>
        </template>

        <Button leading-icon="lucide:rocket">Leading Icon</Button>
        <Button trailing-icon="lucide:rocket">Trailing Icon</Button>
        <Button leading-icon="lucide:rocket" trailing-icon="lucide:rocket">Button</Button>

        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
    `,
  }),
};

export const Square: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({ sizes: ["sm", "md", "lg"] }),
    template: `
      <div class="flex items-center gap-2">
        <template v-for="size in sizes" :key="size">
          <Button :size="size" square icon="lucide:rocket" />
        </template>
      </div>
    `,
  }),
};

export const Links: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <Button label="Internal Link" href="/about" />
        <Button label="External Link" href="https://example.com" target="_blank" />
        <Button label="Disabled Link" href="https://example.com" disabled />
      </div>
    `,
  }),
};

export const FieldGroup: Story = {
  render: () => ({
    components: { Button, FormFieldGroup },
    template: `
      <FormFieldGroup>
        <Button label="First" variant="outline" color="neutral" />
        <Button label="Second" variant="outline" color="neutral" />
        <Button label="Third" variant="outline" color="neutral" />
      </FormFieldGroup>
    `,
  }),
};

export const AutoLoading: Story = {
  args: {
    label: "Submit",
    loadingAuto: true,
    // oxlint-disable-next-line no-promise-executor-return
    onClick: fn(() => new Promise<void>((resolve) => setTimeout(resolve, 300))),
  },
  async play({ canvas, userEvent, args }) {
    const button = canvas.getByRole("button");

    await userEvent.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(button).not.toBeDisabled());
  },
};
