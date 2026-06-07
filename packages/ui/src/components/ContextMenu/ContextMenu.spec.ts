import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent } from "vue";

import ContextMenu from "./ContextMenu.vue";
import type { ContextMenuItem, ContextMenuProps } from "./ContextMenu.vue";

const ContextMenuWrapper = defineComponent({
  components: { ContextMenu: ContextMenu as any },
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

  const linkItems: ContextMenuItem[][] = [
    [
      { type: "link", label: "Internal Page", href: "/about" },
      { type: "link", label: "External Site", href: "https://example.com", target: "_blank" },
      { type: "link", label: "Disabled Link", href: "https://example.com", disabled: true },
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
    ["with link items", { props: { ...props, items: linkItems } }],
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
    ["with disabled", { props: { ...props, items: simpleItems, disabled: true } }],
    ...sizes.map((size) => [`with size ${size}`, { props: { ...props, items: simpleItems, size } }]),
    ["with class", { props: { ...props, items: simpleItems, class: "min-w-48" } }],
    ["with ui", { props: { ...props, items: simpleItems, ui: { content: "min-w-48" } } }],
  ] as [string, { props?: ContextMenuProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(ContextMenuWrapper, options);

    await userEvent.click(screen.getByText("Trigger"), { button: "right" });

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("Keyboard Shortcuts", () => {
    test("combination shortcut triggers onSelect", async () => {
      const onSelect = vi.fn();
      await page.render(ContextMenuWrapper, {
        props: {
          portal: false,
          items: [[{ label: "Undo", shortcut: "Control+Z", onSelect }]],
        },
      });

      await userEvent.keyboard("{Control>}z{/Control}");

      expect(onSelect).toHaveBeenCalled();
    });

    test("sequence shortcut triggers onSelect", async () => {
      const onSelect = vi.fn();
      await page.render(ContextMenuWrapper, {
        props: {
          portal: false,
          items: [[{ label: "Go to Definition", shortcut: "G-D", onSelect }]],
        },
      });

      await userEvent.keyboard("gd");

      expect(onSelect).toHaveBeenCalled();
    });

    test("single-key shortcut triggers onSelect", async () => {
      const onSelect = vi.fn();
      await page.render(ContextMenuWrapper, {
        props: {
          portal: false,
          items: [[{ label: "Pencil", shortcut: "F", onSelect }]],
        },
      });

      await userEvent.keyboard("f");

      expect(onSelect).toHaveBeenCalled();
    });

    test("nested shortcut in children triggers onSelect", async () => {
      const onSelect = vi.fn();
      await page.render(ContextMenuWrapper, {
        props: {
          portal: false,
          items: [[{ label: "Edit", children: [{ label: "Undo", shortcut: "Control+Z", onSelect }] }]],
        },
      });

      await userEvent.keyboard("{Control>}z{/Control}");

      expect(onSelect).toHaveBeenCalled();
    });

    test("items without shortcut do not register any shortcut", async () => {
      const onSelect = vi.fn();
      await page.render(ContextMenuWrapper, {
        props: {
          portal: false,
          items: [[{ label: "No Shortcut", onSelect }]],
        },
      });

      await userEvent.keyboard("{Control>}z{/Control}");

      expect(onSelect).not.toHaveBeenCalled();
    });
  });
});
