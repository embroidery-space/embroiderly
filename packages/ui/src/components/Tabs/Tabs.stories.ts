import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import TabsDemo from "./stories/TabsDemo.vue";
import TabsSizes from "./stories/TabsSizes.vue";
import Tabs from "./Tabs.vue";
import type { TabsItem } from "./Tabs.vue";

const sizes = ["sm", "md", "lg"] as const;
const orientations = ["horizontal", "vertical"] as const;

const items: TabsItem[] = [
  { label: "Tab 1", content: "Lorem ipsum" },
  { label: "Tab 2", content: "dolor sit amet" },
  { label: "Tab 3", content: "consectetur adipiscing elit" },
];

const meta = {
  title: "Navigation/Tabs",
  // @ts-expect-error `Tabs` is a generic component.
  component: Tabs,
  argTypes: {
    orientation: { control: "select", options: orientations },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    orientation: "horizontal",
    size: "md",
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { TabsDemo },
      setup: () => ({ args, items, updateArgs }),
      template: `
        <TabsDemo
          v-bind="args"
          :items="items"
          @update:model-value="(value) => updateArgs({ modelValue: value })"
        />
      `,
    };
  },
};

export const Vertical: Story = {
  render: () => ({
    components: { TabsDemo },
    setup: () => ({ items }),
    template: `<TabsDemo :items="items" orientation="vertical" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TabsSizes },
    setup: () => ({ items }),
    template: `<TabsSizes :items="items" />`,
  }),
};

export const Selected: Story = {
  args: { items, "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("tab", { name: "Tab 2" }));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("1");
  },
};
