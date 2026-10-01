import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, within } from "storybook/test";

import TreeDemo from "./stories/TreeDemo.vue";
import TreeSizes from "./stories/TreeSizes.vue";
import TreeStates from "./stories/TreeStates.vue";
import Tree from "./Tree.vue";
import type { TreeItem } from "./Tree.vue";

const sizes = ["sm", "md", "lg"] as const;

const items: TreeItem[] = [
  {
    label: "My Layers",
    value: "my-layer",
    children: [
      { label: "Full Stitches", value: "full" },
      { label: "Petite Stitches", value: "petite" },
      { label: "Half Stitches", value: "half" },
      { label: "Quarter Stitches", value: "Quarter" },
      { label: "Special Stitches", value: "special" },
      { label: "Back Stitches", value: "back" },
      { label: "Straight Stitches", value: "straight" },
      { label: "French Knots", value: "french-knot" },
      { label: "Bead", value: "bead" },
    ],
    defaultExpanded: true,
  },
  { label: "Reference Image", value: "reference-image" },
];

const nestedItems: TreeItem[] = [
  {
    label: "src",
    value: "src",
    defaultExpanded: true,
    children: [
      {
        label: "components",
        value: "components",
        defaultExpanded: true,
        children: [
          {
            label: "Button",
            value: "button",
            children: [
              { label: "Button.vue", value: "button-vue" },
              { label: "Button.spec.ts", value: "button-spec" },
            ],
          },
          {
            label: "Tree",
            value: "tree",
            defaultExpanded: true,
            children: [
              { label: "Tree.vue", value: "tree-vue" },
              { label: "Tree.spec.ts", value: "tree-spec" },
              { label: "Tree.story.vue", value: "tree-story" },
            ],
          },
        ],
      },
      { label: "main.ts", value: "main-ts" },
    ],
  },
  { label: "package.json", value: "package-json" },
];

const meta = {
  title: "Data/Tree",
  // @ts-expect-error `Tree` is a generic component.
  component: Tree,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Tree>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    size: "md",
    disabled: false,
  },
  render: (args) => ({
    components: { TreeDemo },
    setup: () => ({ args, items }),
    template: `<TreeDemo v-bind="args" :items="items" />`,
  }),
};

export const Nested: Story = {
  render: () => ({
    components: { TreeDemo },
    setup: () => ({ nestedItems }),
    template: `<TreeDemo :items="nestedItems" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TreeSizes },
    setup: () => ({ items }),
    template: `<TreeSizes :items="items" />`,
  }),
};

export const States: Story = {
  args: { items },
  render: () => ({
    components: { TreeStates },
    setup: () => ({ items }),
    template: `<TreeStates :items="items" />`,
  }),
};

export const Selected: Story = {
  args: { items, "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("treeitem", { name: "Reference Image" }));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalled();
  },
};

export const DisabledItem: Story = {
  args: {
    items: [
      {
        label: "My Layers",
        value: "my-layer",
        defaultExpanded: true,
        children: [
          { label: "Full Stitches", value: "full", disabled: true },
          { label: "Petite Stitches", value: "petite" },
        ],
      },
    ],
    "onUpdate:modelValue": fn(),
  },
  tags: ["!autodocs", "!snapshot"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("treeitem", { name: "Full Stitches" }));
    await expect(args["onUpdate:modelValue"]).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole("treeitem", { name: "Petite Stitches" }));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalled();
  },
};

export const Toggled: Story = {
  args: { items: nestedItems, "onUpdate:expanded": fn() },
  tags: ["!autodocs", "!snapshot"],
  async play({ canvas, userEvent, args }) {
    const button = within(canvas.getByRole("treeitem", { name: "Button" })).getByRole("button");
    await userEvent.click(button);

    await expect(args["onUpdate:expanded"]).toHaveBeenCalled();
    await expect(canvas.getByRole("treeitem", { name: "Button.vue" })).toBeVisible();
  },
};
