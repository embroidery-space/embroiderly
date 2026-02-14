import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent, nextTick } from "vue";

import type { ContextMenuItem, ContextMenuProps } from "./ContextMenu.vue";
import ContextMenu from "./ContextMenu.vue";

const ContextMenuWrapper = defineComponent({
  components: { ContextMenu },
  inheritAttrs: false,
  template: `
  <ContextMenu v-bind="$attrs">
    <span>Trigger</span>
  </ContextMenu>
  `,
});

describe("ContextMenu", () => {
  const sizes = ["sm", "md", "lg"] as const;

  const simpleItems: ContextMenuItem[][] = [
    [
      { icon: "lucide:scissors", label: "Cut" },
      { icon: "lucide:copy", label: "Copy" },
      { icon: "lucide:clipboard", label: "Paste", disabled: true },
    ],
    [{ label: "Select All" }],
  ];

  const checkboxItems: ContextMenuItem[][] = [
    [
      { type: "label", label: "View" },
      { type: "separator" },
      { type: "checkbox", label: "Show Grid", checked: true },
      { type: "checkbox", label: "Show Rulers", checked: false },
      { type: "checkbox", label: "Snap to Grid", disabled: true },
    ],
  ];

  const submenuItems: ContextMenuItem[][] = [
    [
      {
        label: "File",
        children: [{ label: "New" }, { label: "Open" }, { type: "separator" }, { label: "Save" }],
      },
      {
        label: "Edit",
        children: [
          [{ label: "Undo" }, { label: "Redo" }],
          [{ label: "Cut" }, { label: "Copy" }],
        ],
      },
    ],
  ];

  const props: ContextMenuProps = { portal: false };

  test.each([
    ["with simple items", { props: { ...props, items: simpleItems } }],
    ["with checkbox items", { props: { ...props, items: checkboxItems } }],
    ["with submenu items", { props: { ...props, items: submenuItems } }],
    ["with disabled", { props: { ...props, items: simpleItems, disabled: true } }],
    ...sizes.map((size) => [`with size ${size}`, { props: { ...props, items: simpleItems, size } }]),
    ["with class", { props: { ...props, items: simpleItems, class: "min-w-48" } }],
    ["with ui", { props: { ...props, items: simpleItems, ui: { content: "min-w-48" } } }],
  ] as [string, { props?: ContextMenuProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(ContextMenuWrapper, options);
    await nextTick();

    const trigger = screen.getByText("Trigger");
    await userEvent.click(trigger, { button: "right" });

    await nextTick();
    expect(screen.container).toMatchSnapshot();
  });
});
