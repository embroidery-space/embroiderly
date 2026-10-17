import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import FormFieldSet from "./FormFieldSet.vue";
import FormFieldSetCollapsible from "./stories/FormFieldSetCollapsible.vue";
import FormFieldSetDemo from "./stories/FormFieldSetDemo.vue";

const meta = {
  title: "Form/FormFieldSet",
  component: FormFieldSet,
} satisfies Meta<typeof FormFieldSet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    legend: "Legend",
    collapsible: false,
  },
  render: (args) => ({
    components: { FormFieldSetDemo },
    setup: () => ({ args }),
    template: `<FormFieldSetDemo v-bind="args" />`,
  }),
};

export const Collapsed: Story = {
  args: { legend: "Legend", collapsible: true, open: false },
  render: (args) => ({
    components: { FormFieldSetCollapsible },
    setup: () => ({ args }),
    template: `<FormFieldSetCollapsible v-bind="args" />`,
  }),
};

export const Collapsible: Story = {
  args: { legend: "Legend", collapsible: true },
  tags: ["!autodocs", "!snapshot"],
  render: Collapsed.render,
  async play({ canvas, userEvent }) {
    const trigger = canvas.getByRole("button");

    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};
