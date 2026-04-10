import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { nextTick } from "vue";

import Tree from "./Tree.vue";
import type { TreeItem, TreeProps, TreeSlots } from "./Tree.vue";

describe("Tree", () => {
  const sizes = ["sm", "md", "lg"] as const;

  const flatItems: TreeItem[] = [
    { label: "Item 1", value: "item-1" },
    { label: "Item 2", value: "item-2" },
    { label: "Item 3", value: "item-3" },
  ];

  const nestedItems: TreeItem[] = [
    {
      label: "Parent 1",
      value: "parent-1",
      children: [
        { label: "Child 1", value: "child-1" },
        { label: "Child 2", value: "child-2" },
      ],
    },
    { label: "Item 2", value: "item-2" },
    {
      label: "Parent 3",
      value: "parent-3",
      slot: "custom",
      children: [{ label: "Child 3", value: "child-3" }],
    },
  ];

  test.each([
    ["with flat items", { props: { items: flatItems } }],
    ["with nested items", { props: { items: nestedItems } }],
    ...sizes.map((size) => [`with size ${size}`, { props: { items: flatItems, size } }]),
    ["with disabled tree", { props: { items: flatItems, disabled: true } }],
    [
      "with defaultExpanded item",
      {
        props: {
          items: nestedItems,
          defaultExpanded: ["parent-1"],
        },
      },
    ],
    [
      "with item defaultExpanded true",
      {
        props: {
          items: [
            {
              label: "Auto Expanded",
              value: "auto",
              defaultExpanded: true,
              children: [{ label: "Child", value: "auto-child" }],
            },
          ],
        },
      },
    ],
    [
      "with icons",
      {
        props: {
          items: [
            { label: "Icon Item", value: "icon-item", icon: "lucide:folder" },
            { label: "Leaf Item", value: "leaf-item", icon: "lucide:file" },
          ],
        },
      },
    ],
    [
      "with scroll",
      {
        props: {
          items: flatItems,
          scroll: { type: "always" },
        },
      },
    ],
    [
      "with class",
      {
        props: {
          items: flatItems,
          class: "custom-class",
        },
      },
    ],
    [
      "with ui",
      {
        props: {
          items: flatItems,
          ui: { root: "custom-root", item: "custom-item" },
        },
      },
    ],
    [
      "with item slot",
      {
        props: { items: flatItems },
        slots: { item: (props: { item: TreeItem }) => `Custom: ${props.item.label}` },
      },
    ],
    [
      "with item-leading slot",
      {
        props: { items: flatItems },
        slots: { "item-leading": () => "Leading" },
      },
    ],
    [
      "with item-label slot",
      {
        props: { items: flatItems },
        slots: { "item-label": (props: { item: TreeItem }) => `Label: ${props.item.label}` },
      },
    ],
    [
      "with item-trailing slot",
      {
        props: { items: flatItems },
        slots: { "item-trailing": () => "Trailing" },
      },
    ],
    [
      "with dynamic slot",
      {
        props: { items: nestedItems },
        slots: { custom: () => "Custom slot content" },
      },
    ],
  ] as [string, { props?: TreeProps; slots?: Partial<TreeSlots> }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(Tree as any, options);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue on item click", async () => {
      const screen = page.render(Tree, { props: { items: flatItems } });
      await nextTick();

      const treeItem = screen.getByRole("treeitem", { name: "Item 2" });
      await userEvent.click(treeItem.element());

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });

    test("update:expanded on chevron click", async () => {
      const screen = page.render(Tree, { props: { items: nestedItems } });
      await nextTick();

      const chevron = screen.getByRole("treeitem", { name: "Parent 1" }).getByRole("button");
      await userEvent.click(chevron.element());

      expect(screen.emitted()).toHaveProperty("update:expanded");
    });
  });
});
