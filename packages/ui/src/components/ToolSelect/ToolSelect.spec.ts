import { TooltipProvider } from "reka-ui";
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { defineComponent, nextTick } from "vue";

import ToolSelect from "./ToolSelect.vue";
import type { ToolSelectProps } from "./ToolSelect.vue";

const SINGLE_ITEM = [{ label: "Pencil", icon: "lucide:pencil", value: "pencil" }];
const MULTIPLE_ITEMS = [
  { label: "Pencil", icon: "lucide:pencil", value: "pencil" },
  { label: "Eraser", icon: "lucide:eraser", value: "eraser" },
  { label: "Brush", icon: "lucide:brush", value: "brush" },
];

const ToolSelectWrapper = defineComponent({
  components: { TooltipProvider, ToolSelect },
  inheritAttrs: false,
  template: `
  <TooltipProvider>
    <ToolSelect v-bind="$attrs" />
  </TooltipProvider>
`,
});

describe("ToolSelect", () => {
  describe("Rendering States", () => {
    const sizes = ["sm", "md", "lg"] as const;

    test.each([
      ["single item", { props: { items: SINGLE_ITEM } }],
      ["multiple items", { props: { items: MULTIPLE_ITEMS } }],
      ...sizes.map((size) => [`with size ${size}`, { props: { items: MULTIPLE_ITEMS, size } }]),
      ["with custom selection color", { props: { items: MULTIPLE_ITEMS, selectionColor: "var(--color-error)" } }],
      ["when selected", { props: { modelValue: "pencil", items: MULTIPLE_ITEMS } }],
      ["when disabled", { props: { items: MULTIPLE_ITEMS, disabled: true } }],
      ["with class", { props: { items: MULTIPLE_ITEMS, class: "custom-class" } }],
      ["with ui", { props: { items: MULTIPLE_ITEMS, ui: { root: "custom-root" } } }],
    ] as [string, { props: ToolSelectProps & { modelValue: string } }][])(
      "renders correctly %s",
      async (_, options) => {
        const screen = page.render(ToolSelectWrapper, options);
        await nextTick();

        expect(screen.container.outerHTML).toMatchSnapshot();
      },
    );

    test("renders a single option without a dropdown button", async () => {
      const screen = page.render(ToolSelectWrapper, {
        props: {
          modelValue: "pencil",
          items: SINGLE_ITEM,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await expect.element(mainButton).toBeInTheDocument();

      const dropdownButton = screen.getByTestId("tool-selector-dropdown-button");
      await expect.element(dropdownButton).not.toBeInTheDocument();
    });

    test("renders multiple options with a dropdown button", async () => {
      const screen = page.render(ToolSelectWrapper, {
        props: {
          modelValue: "pencil",
          items: MULTIPLE_ITEMS,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await expect.element(mainButton).toBeInTheDocument();

      const dropdownButton = screen.getByTestId("tool-selector-dropdown-button");
      await expect.element(dropdownButton).toBeInTheDocument();
    });

    test("renders ARIA attributes when multiple items", async () => {
      const screen = page.render(ToolSelectWrapper, {
        props: {
          modelValue: "pencil",
          items: MULTIPLE_ITEMS,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await expect.element(mainButton).toHaveAttribute("aria-haspopup", "menu");
      await expect.element(mainButton).toHaveAttribute("aria-expanded", "false");
    });

    test("dropdown button has tabindex -1 and aria-hidden", async () => {
      const screen = page.render(ToolSelectWrapper, {
        props: {
          modelValue: "pencil",
          items: MULTIPLE_ITEMS,
        },
      });

      const dropdownButton = screen.getByTestId("tool-selector-dropdown-button");
      await expect.element(dropdownButton).toHaveAttribute("tabindex", "-1");
      await expect.element(dropdownButton).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Dropdown Interaction", () => {
    test("a click on the dropdown button opens the dropdown menu", async () => {
      const screen = page.render(ToolSelectWrapper, {
        props: {
          modelValue: "pencil",
          items: MULTIPLE_ITEMS,
        },
      });

      const dropdownButton = screen.getByTestId("tool-selector-dropdown-button");
      await dropdownButton.click();

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).toBeInTheDocument();

      const dropdownMenuItems = screen.getByRole("menuitem");
      await expect.element(dropdownMenuItems).toHaveLength(MULTIPLE_ITEMS.length);
    });

    test("a right-click on the main button opens the dropdown menu", async () => {
      const screen = page.render(ToolSelectWrapper, {
        props: {
          modelValue: "pencil",
          items: MULTIPLE_ITEMS,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await mainButton.click({ button: "right" });

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).toBeInTheDocument();

      const dropdownMenuItems = screen.getByRole("menuitem");
      await expect.element(dropdownMenuItems).toHaveLength(MULTIPLE_ITEMS.length);
    });

    test("a right-click on the single-option main button does nothing", async () => {
      const screen = page.render(ToolSelectWrapper, {
        props: {
          modelValue: "pencil",
          items: SINGLE_ITEM,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await mainButton.click({ button: "right" });

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).not.toBeInTheDocument();
    });

    test("a long-press on the main button opens the dropdown menu", async () => {
      const screen = page.render(ToolSelectWrapper, {
        props: {
          modelValue: "pencil",
          items: MULTIPLE_ITEMS,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await mainButton.click({ duration: 600 });

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).toBeInTheDocument();
    });

    test("a long-press on the single-option main button does nothing", async () => {
      const screen = page.render(ToolSelectWrapper, {
        props: {
          modelValue: "pencil",
          items: SINGLE_ITEM,
          "onUpdate:modelValue": vi.fn(),
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await mainButton.click({ duration: 600 });

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).not.toBeInTheDocument();
    });

    test("a click on an option from dropdown menu selects it", async () => {
      const onUpdate = vi.fn();

      const screen = page.render(ToolSelectWrapper, {
        props: {
          modelValue: "pencil",
          items: MULTIPLE_ITEMS,
          "onUpdate:modelValue": onUpdate,
        },
      });

      const dropdownButton = screen.getByTestId("tool-selector-dropdown-button");
      expect(dropdownButton).toBeInTheDocument();

      await dropdownButton.click();

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).toBeInTheDocument();

      const targetDropdownMenuItem = screen.getByRole("menuitem").nth(1);
      await targetDropdownMenuItem.click();

      expect(onUpdate).toHaveBeenCalledWith(MULTIPLE_ITEMS[1].value);
      await expect.element(dropdownMenu).not.toBeInTheDocument();
    });
  });
});
