import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent, nextTick } from "vue";

import DropdownMenu from "./DropdownMenu.vue";
import type { DropdownMenuItem, DropdownMenuProps } from "./DropdownMenu.vue";

const DropdownMenuWrapper = defineComponent({
  components: { DropdownMenu: DropdownMenu as any },
  inheritAttrs: false,
  template: `
  <DropdownMenu v-bind="$attrs">
    <span>Trigger</span>
  </DropdownMenu>
  `,
});

describe("DropdownMenu", () => {
  const sizes = ["sm", "md", "lg"] as const;

  const simpleItems: DropdownMenuItem[][] = [
    [
      { icon: "lucide:scissors", label: "Cut" },
      { icon: "lucide:copy", label: "Copy" },
      { icon: "lucide:clipboard", label: "Paste", disabled: true },
    ],
    [{ label: "Select All" }],
  ];

  const checkboxItems: DropdownMenuItem[][] = [
    [
      { type: "label", label: "View" },
      { type: "separator" },
      { type: "checkbox", label: "Show Grid", checked: true },
      { type: "checkbox", label: "Show Rulers", checked: false },
      { type: "checkbox", label: "Snap to Grid", disabled: true },
    ],
  ];

  const submenuItems: DropdownMenuItem[][] = [
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

  const props: DropdownMenuProps = { portal: false };

  test.each([
    ["with simple items", { props: { ...props, items: simpleItems } }],
    ["with checkbox items", { props: { ...props, items: checkboxItems } }],
    ["with submenu items", { props: { ...props, items: submenuItems } }],
    ["with disabled", { props: { ...props, items: simpleItems, disabled: true } }],
    ...sizes.map((size) => [`with size ${size}`, { props: { ...props, items: simpleItems, size } }]),
    ["with class", { props: { ...props, items: simpleItems, class: "min-w-48" } }],
    [
      "with shortcuts",
      {
        props: {
          ...props,
          items: [
            [
              { label: "Undo", shortcut: "Ctrl+Z", onSelect: () => {} },
              { label: "Redo", shortcut: "Ctrl+Shift+Z", onSelect: () => {} },
              { label: "Go to Definition", shortcut: "G-D", onSelect: () => {} },
            ],
          ],
        },
      },
    ],
    ["with ui", { props: { ...props, items: simpleItems, ui: { content: "min-w-48" } } }],
  ] as [string, { props?: DropdownMenuProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(DropdownMenuWrapper, options);
    await nextTick();

    const trigger = screen.getByText("Trigger");
    await userEvent.click(trigger);

    await nextTick();
    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
