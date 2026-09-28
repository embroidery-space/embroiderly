import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Splitter from "./Splitter.vue";
import SplitterCollapsible from "./stories/SplitterCollapsible.vue";
import SplitterDemo from "./stories/SplitterDemo.vue";
import SplitterNested from "./stories/SplitterNested.vue";

const directions = ["horizontal", "vertical"] as const;

const meta = {
  title: "Layout/Splitter",
  component: Splitter,
  argTypes: {
    direction: { control: "select", options: directions },
  },
} satisfies Meta<typeof Splitter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    direction: "horizontal",
  },
  render: (args) => ({
    components: { SplitterDemo },
    setup: () => ({ args }),
    template: `<SplitterDemo v-bind="args" />`,
  }),
};

export const Nested: Story = {
  args: { direction: "horizontal" },
  render: () => ({
    components: { SplitterNested },
    template: `<SplitterNested />`,
  }),
};

export const Collapsible: Story = {
  args: { direction: "horizontal" },
  render: () => ({
    components: { SplitterCollapsible },
    template: `<SplitterCollapsible />`,
  }),
};
