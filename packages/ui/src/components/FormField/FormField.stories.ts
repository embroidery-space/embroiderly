import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import FormField from "./FormField.vue";
import type { FormFieldProps } from "./FormField.vue";
import FormFieldAccessibility from "./stories/FormFieldAccessibility.vue";
import FormFieldDemo from "./stories/FormFieldDemo.vue";
import FormFieldSizes from "./stories/FormFieldSizes.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/FormField",
  component: FormField,
  argTypes: {
    size: { control: "select", options: sizes },
    label: { control: "text" },
    description: { control: "text" },
    hint: { control: "text" },
    help: { control: "text" },
  },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: StoryObj<FormFieldProps> = {
  args: {
    size: "lg",
    label: "Email address",
    description: "",
    hint: "",
    help: "",
  },
  render: (args) => ({
    components: { FormFieldDemo },
    setup: () => ({ args }),
    template: `<FormFieldDemo v-bind="args" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { FormFieldSizes },
    template: `<FormFieldSizes />`,
  }),
};

export const Accessibility: Story = {
  args: {
    label: "Label",
    description: "Description",
    hint: "Hint",
    help: "Help",
  },
  render: (args) => ({
    components: { FormFieldAccessibility },
    setup: () => ({ args }),
    template: `<FormFieldAccessibility v-bind="args" />`,
  }),
  async play({ canvas }) {
    const input = canvas.getByRole("textbox");
    const inputId = input.getAttribute("id");
    await expect(inputId).not.toBeNull();

    await expect(canvas.getByText("Label")).toHaveAttribute("for", inputId);
    await expect(canvas.getByText("Description")).toHaveAttribute("id", `${inputId}-description`);
    await expect(canvas.getByText("Hint")).toHaveAttribute("id", `${inputId}-hint`);
    await expect(canvas.getByText("Help")).toHaveAttribute("id", `${inputId}-help`);
  },
};
