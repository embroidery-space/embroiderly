import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import ToolToggleDemo from "./stories/ToolToggleDemo.vue";
import ToolToggleStates from "./stories/ToolToggleStates.vue";
import ToolToggle from "./ToolToggle.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Toolbar/ToolToggle",
  component: ToolToggle,
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    shortcut: { control: "text" },
    tooltip: { control: "text" },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof ToolToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: false,
    icon: "lucide:eye",

    label: "",
    description: "",

    shortcut: "Ctrl+S",
    tooltip: "Show symbols",

    size: "lg",
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { ToolToggleDemo },
      setup: () => ({ args, updateArgs }),
      template: `
        <ToolToggleDemo v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />
      `,
    };
  },
};

export const Compact: Story = {
  args: { icon: "lucide:eye" },
  render: () => ({
    components: { ToolToggleDemo },
    template: `<ToolToggleDemo icon="lucide:eye" tooltip="Show symbols" shortcut="Ctrl+S" />`,
  }),
};

export const Expanded: Story = {
  args: { icon: "lucide:eye" },
  render: () => ({
    components: { ToolToggleDemo },
    template: `
      <ToolToggleDemo
        icon="lucide:eye"
        label="Show symbols"
        description="Toggle symbol visibility on the canvas"
        shortcut="Ctrl+S"
      />
    `,
  }),
};

export const States: Story = {
  args: { icon: "lucide:eye" },
  render: () => ({
    components: { ToolToggleStates },
    template: `<ToolToggleStates />`,
  }),
};

export const ShortcutToggled: Story = {
  args: { icon: "lucide:eye", tooltip: "Show", shortcut: "S", "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  async play({ userEvent, args }) {
    await userEvent.keyboard("s");
    await expect(args["onUpdate:modelValue"]).toHaveBeenLastCalledWith(true);
  },
};

export const DisabledShortcutIgnored: Story = {
  args: { icon: "lucide:eye", tooltip: "Show", shortcut: "S", disabled: true, "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  parameters: { snapshot: { enable: false } },
  async play({ userEvent, args }) {
    await userEvent.keyboard("s");
    await expect(args["onUpdate:modelValue"]).not.toHaveBeenCalled();
  },
};
