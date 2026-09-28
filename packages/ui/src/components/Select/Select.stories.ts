import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import Select from "./Select.vue";
import type { SelectItem } from "./Select.vue";
import SelectDemo from "./stories/SelectDemo.vue";
import SelectOpen from "./stories/SelectOpen.vue";
import SelectSizes from "./stories/SelectSizes.vue";
import SelectStates from "./stories/SelectStates.vue";
import SelectVariants from "./stories/SelectVariants.vue";

const sizes = ["sm", "md", "lg"] as const;
const variants = ["subtle", "outline"] as const;

const items: SelectItem[] = [
  { label: "Backlog", value: "backlog" },
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
  { label: "Cancelled", value: "cancelled" },
];

const richItems: SelectItem[][] = [
  [
    { type: "label", label: "Active" },
    { label: "Backlog", value: "backlog", icon: "lucide:circle-dashed" },
    { label: "Todo", value: "todo", icon: "lucide:circle" },
    { label: "In Progress", value: "in-progress", icon: "lucide:circle-half" },
  ],
  [
    { type: "label", label: "Closed" },
    { label: "Done", value: "done", icon: "lucide:circle-check" },
    { label: "Cancelled", value: "cancelled", icon: "lucide:circle-x", disabled: true },
  ],
];

const meta = {
  title: "Form/Select",
  // @ts-expect-error `Select` is a generic component.
  component: Select,
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    variant: "subtle",
    size: "md",

    disabled: false,
    loading: false,
    searchInput: false,
    placeholder: "Select a status...",
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { SelectDemo },
      setup: () => ({ args, richItems, updateArgs }),
      template: `
        <SelectDemo
          v-bind="args"
          :items="richItems"
          @update:model-value="(value) => updateArgs({ modelValue: value })"
        />
      `,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { SelectSizes },
    setup: () => ({ items }),
    template: `<SelectSizes :items="items" />`,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { SelectVariants },
    setup: () => ({ items }),
    template: `<SelectVariants :items="items" />`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { SelectStates },
    setup: () => ({ items }),
    template: `<SelectStates :items="items" />`,
  }),
};

export const Open: Story = {
  args: {
    ...Demo.args,
    defaultOpen: true,
    portal: false, // `portal` must be disabled here so the opened content stays inside the captured snapshot subject.
  },
  render: (args) => ({
    components: { SelectOpen },
    setup: () => ({ args, richItems }),
    template: `<SelectOpen v-bind="args" :items="richItems" />`,
  }),
  async play({ canvas }) {
    await expect(canvas.getByRole("option", { name: "Backlog" })).toBeVisible();
  },
};

export const Selected: Story = {
  args: { items, portal: false, "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(canvas.getAllByRole("option")[0]!);
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("backlog");
  },
};
