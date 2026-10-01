import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import ToolSelectDemo from "./stories/ToolSelectDemo.vue";
import ToolSelectOpen from "./stories/ToolSelectOpen.vue";
import ToolSelectSizes from "./stories/ToolSelectSizes.vue";
import ToolSelectStates from "./stories/ToolSelectStates.vue";
import ToolSelect from "./ToolSelect.vue";
import type { ToolSelectItem } from "./ToolSelect.vue";

const sizes = ["sm", "md", "lg"] as const;

const singleItem: ToolSelectItem[] = [{ label: "Pencil", icon: "lucide:pencil", value: "pencil" }];
const multipleItems: ToolSelectItem[] = [
  { label: "Pencil", icon: "lucide:pencil", value: "pencil", shortcut: "P" },
  { label: "Eraser", icon: "lucide:eraser", value: "eraser", shortcut: "E" },
  { label: "Brush", icon: "lucide:brush", value: "brush", shortcut: "B" },
];

const meta = {
  title: "Toolbar/ToolSelect",
  // @ts-expect-error `ToolSelect` is a generic component.
  component: ToolSelect,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof ToolSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: "pencil",
    items: multipleItems,
    size: "lg",
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { ToolSelectDemo },
      setup: () => ({ args, multipleItems, updateArgs }),
      template: `
        <ToolSelectDemo
          v-bind="args"
          :items="multipleItems"
          @update:model-value="(value) => updateArgs({ modelValue: value })"
        />
      `,
    };
  },
};

export const SingleItem: Story = {
  args: { modelValue: "pencil", items: singleItem },
  render: (args) => ({
    components: { ToolSelectDemo },
    setup: () => ({ args, singleItem }),
    template: `<ToolSelectDemo v-bind="args" :items="singleItem" />`,
  }),
};

export const CustomSelectionColor: Story = {
  args: { modelValue: "pencil", items: multipleItems },
  render: (args) => ({
    components: { ToolSelectDemo },
    setup: () => ({ args, multipleItems }),
    template: `<ToolSelectDemo v-bind="args" :items="multipleItems" selection-color="var(--color-error)" />`,
  }),
};

export const Sizes: Story = {
  args: { items: multipleItems },
  render: () => ({
    components: { ToolSelectSizes },
    setup: () => ({ multipleItems }),
    template: `<ToolSelectSizes :items="multipleItems" />`,
  }),
};

export const States: Story = {
  args: { items: multipleItems },
  render: () => ({
    components: { ToolSelectStates },
    setup: () => ({ multipleItems }),
    template: `<ToolSelectStates :items="multipleItems" />`,
  }),
};

export const Open: Story = {
  args: { ...Demo.args, defaultOpen: true, portal: false },
  render: (args) => ({
    components: { ToolSelectOpen },
    setup: () => ({ args, multipleItems }),
    template: `<ToolSelectOpen v-bind="args" :items="multipleItems" />`,
  }),
};

export const Selected: Story = {
  args: { items: multipleItems, portal: false, "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  render: (args) => ({
    components: { ToolSelectDemo },
    setup: () => ({ args, multipleItems }),
    template: `<ToolSelectDemo v-bind="args" :items="multipleItems" />`,
  }),
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByTestId("tool-selector-dropdown-button"));
    await userEvent.click(canvas.getAllByRole("menuitem")[1]!);
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("eraser");
  },
};

export const ShortcutSelected: Story = {
  args: { items: multipleItems, "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  render: (args) => ({
    components: { ToolSelectDemo },
    setup: () => ({ args, multipleItems }),
    template: `<ToolSelectDemo v-bind="args" :items="multipleItems" />`,
  }),
  async play({ userEvent, args }) {
    await userEvent.keyboard("b");
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("brush");
  },
};
