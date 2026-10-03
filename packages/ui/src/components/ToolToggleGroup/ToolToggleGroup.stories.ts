import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import ToolToggleGroupDemo from "./stories/ToolToggleGroupDemo.vue";
import ToolToggleGroupStates from "./stories/ToolToggleGroupStates.vue";
import ToolToggleGroup from "./ToolToggleGroup.vue";
import type { ToolToggleItem } from "./ToolToggleGroup.vue";

const orientations = ["horizontal", "vertical"] as const;
const sizes = ["sm", "md", "lg"] as const;

const compactItems: ToolToggleItem[] = [
  { icon: "lucide:square", tooltip: "Solid", value: "solid" },
  { icon: "lucide:grid-2x2", tooltip: "Stitches", value: "stitches" },
  { icon: "lucide:blend", tooltip: "Mixed", value: "mixed" },
];

const expandedItems: ToolToggleItem[] = [
  { icon: "lucide:square", label: "Solid", description: "View as solid squares", value: "solid" },
  { icon: "lucide:grid-2x2", label: "Stitches", description: "View as individual stitches", value: "stitches" },
  { icon: "lucide:blend", label: "Mixed", description: "Mixed display mode", value: "mixed" },
];

const itemsWithShortcuts: ToolToggleItem[] = [
  { icon: "lucide:square", tooltip: "Solid", value: "solid", shortcut: "S" },
  { icon: "lucide:grid-2x2", tooltip: "Stitches", value: "stitches", shortcut: "T" },
  { icon: "lucide:blend", tooltip: "Mixed", value: "mixed", shortcut: "M" },
];

const meta = {
  title: "Toolbar/ToolToggleGroup",
  // @ts-expect-error `ToolToggleGroup` is a generic component.
  component: ToolToggleGroup,
  argTypes: {
    orientation: { control: "select", options: orientations },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof ToolToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: "solid",
    items: compactItems,
    orientation: "horizontal",
    size: "lg",
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { ToolToggleGroupDemo },
      setup: () => ({ args, compactItems, updateArgs }),
      template: `
        <ToolToggleGroupDemo
          v-bind="args"
          :items="compactItems"
          @update:model-value="(value) => updateArgs({ modelValue: value })"
        />
      `,
    };
  },
};

export const Compact: Story = {
  args: { modelValue: "solid", items: compactItems },
  render: (args) => ({
    components: { ToolToggleGroupDemo },
    setup: () => ({ args, compactItems }),
    template: `<ToolToggleGroupDemo v-bind="args" :items="compactItems" />`,
  }),
};

export const Expanded: Story = {
  args: { modelValue: "solid", items: expandedItems },
  render: (args) => ({
    components: { ToolToggleGroupDemo },
    setup: () => ({ args, expandedItems }),
    template: `<ToolToggleGroupDemo v-bind="args" :items="expandedItems" orientation="vertical" />`,
  }),
};

export const States: Story = {
  args: { items: compactItems },
  render: () => ({
    components: { ToolToggleGroupStates },
    setup: () => ({ compactItems }),
    template: `<ToolToggleGroupStates :items="compactItems" />`,
  }),
};

export const Selected: Story = {
  args: { items: itemsWithShortcuts, "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  async play({ userEvent, args }) {
    await userEvent.keyboard("m");
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("mixed");
  },
};
